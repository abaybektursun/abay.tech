"use client";

/**
 * Mixamo X-Bot rig driven by walker2d qpos.
 *
 * Critical detail: three.js's GLTFLoader runs `PropertyBinding.sanitizeNodeName`
 * on every node name during load — strips reserved chars (`:`, `[`, `]`, `.`, `/`).
 * Mixamo bones in the GLB JSON are named `mixamorig:Spine` with a colon, but at
 * runtime the Bone instances are named `mixamorigSpine`. Looking up by the raw
 * name returns undefined and the rig stays in T-pose.
 *
 * We sanitize the keys ourselves before lookup.
 *
 * Walker2d qpos:
 *   0   rootx (forward)             → root.position.x
 *   1   rootz (vertical)             → root.position.y
 *   2   rooty (torso pitch)
 *   3-5 right thigh / shin / foot
 *   6-8 left  thigh / shin / foot
 */
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Bone,
  Group,
  Object3D,
  PropertyBinding,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";

const AXIS_Z = new Vector3(0, 0, 1);
const _tmpQ = new Quaternion();
const _tmpV = new Vector3();

interface Props {
  qposRef: { current: Float32Array };
}

const MODEL_URL = "/models/biped.glb";
const HINGE_AXIS = new Vector3(1, 0, 0);

const RAW_BONES = {
  spine:    "mixamorig:Spine",
  spine1:   "mixamorig:Spine1",
  rUpLeg:   "mixamorig:RightUpLeg",
  rLeg:     "mixamorig:RightLeg",
  rFoot:    "mixamorig:RightFoot",
  lUpLeg:   "mixamorig:LeftUpLeg",
  lLeg:     "mixamorig:LeftLeg",
  lFoot:    "mixamorig:LeftFoot",
  rArm:     "mixamorig:RightArm",
  lArm:     "mixamorig:LeftArm",
  rForeArm: "mixamorig:RightForeArm",
  lForeArm: "mixamorig:LeftForeArm",
  // Toe bones — used only for ground-clip check, not driven.
  rToe:     "mixamorig:RightToeBase",
  lToe:     "mixamorig:LeftToeBase",
} as const;

// Bone names are sanitized at load time — strip reserved chars to match.
const BONES: Record<keyof typeof RAW_BONES, string> = Object.fromEntries(
  Object.entries(RAW_BONES).map(([k, v]) => [k, PropertyBinding.sanitizeNodeName(v)])
) as Record<keyof typeof RAW_BONES, string>;

const SIGN = {
  torso: 1,
  rHip:  1,
  rKnee: 1,
  rAnkle: 1,
  lHip:  1,
  lKnee: 1,
  lAnkle: 1,
};

// Arm rest offsets — bring arms down from T-pose to natural rest at sides.
// Rotation around bone-local Z. Signs flipped from initial guess: arms
// were going UP into a Y pose; the correct direction is the other way.
const ARM_REST_R =  1.3;
const ARM_REST_L = -1.3;
const FOREARM_REST = 0.25;

// Vertical buffer below the lowest foot/toe bone — accounts for mesh
// extending past the bone position.
const FOOT_BUFFER = 0.02;

// Clamp the ankle angle so the foot can never curl toes-below-horizontal.
// Walker2d ankle range is ±π/4; we keep the side that points toes UP and
// zero out the side that would curl them down.
const ANKLE_MIN = -0.05;  // small allowance for natural flex
const ANKLE_MAX =  0.45;

// Vertical offset: walker2d torso CoM at rest is ~1.25m. Mixamo character
// origin is between the feet at y=0. Subtract so feet land on the ground.
const Y_OFFSET = 1.25;

// Arm pendulum dynamics — secondary motion that responds to body motion
// without a full physics engine.
const ARM_K = 9;      // spring stiffness toward swing target
const ARM_DAMP = 4;   // velocity damping

export function CharacterRig({ qposRef }: Props) {
  const root = useRef<Group>(null!);
  const { scene } = useGLTF(MODEL_URL) as { scene: Group };

  const boneRefs = useRef<Record<string, Bone | undefined>>({});
  const armState = useRef({ rA: 0, rV: 0, lA: 0, lV: 0 });

  useEffect(() => {
    let skinned: SkinnedMesh | null = null;
    scene.traverse((o: Object3D) => {
      if ((o as { isSkinnedMesh?: boolean }).isSkinnedMesh && !skinned) skinned = o as SkinnedMesh;
    });
    if (!skinned) {
      // eslint-disable-next-line no-console
      console.warn("[CharacterRig] no SkinnedMesh");
      return;
    }
    (skinned as SkinnedMesh).frustumCulled = false;
    scene.traverse((o: Object3D) => {
      const m = o as { isMesh?: boolean; isSkinnedMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean };
      if (m.isMesh || m.isSkinnedMesh) { m.castShadow = true; m.receiveShadow = true; }
    });

    const byName: Record<string, Bone> = {};
    for (const bone of (skinned as SkinnedMesh).skeleton.bones) byName[bone.name] = bone;

    boneRefs.current = {};
    const found: string[] = [];
    const missing: string[] = [];
    for (const [k, name] of Object.entries(BONES)) {
      if (byName[name]) { boneRefs.current[k] = byName[name]; found.push(name); }
      else missing.push(name);
    }
    // eslint-disable-next-line no-console
    console.log("[CharacterRig] bones",
      found.length, "/", Object.keys(BONES).length,
      "skel.bones[]:", (skinned as SkinnedMesh).skeleton.bones.length,
      missing.length ? "missing: " + missing.join(",") : "OK");
  }, [scene]);

  useFrame((_, dt) => {
    const q = qposRef.current;
    if (!q || !root.current) return;

    root.current.position.x = q[0];
    root.current.position.y = q[1] - Y_OFFSET;
    root.current.position.z = 0;

    const b = boneRefs.current;

    // Hinge around bone-local X — used for legs/spine.
    const setHingeX = (key: keyof typeof BONES, angle: number) => {
      const bone = b[key];
      if (bone) bone.quaternion.setFromAxisAngle(HINGE_AXIS, angle);
    };
    // Hinge around bone-local Z — used for arms (which need sagittal swing
    // perpendicular to the bone direction, not along it).
    const setHingeZ = (key: keyof typeof BONES, angle: number) => {
      const bone = b[key];
      if (bone) bone.quaternion.setFromAxisAngle(AXIS_Z, angle);
    };

    const torsoTotal = SIGN.torso * q[2];
    setHingeX("spine",  torsoTotal * 0.55);
    setHingeX("spine1", torsoTotal * 0.45);

    // Ankle is clamped to prevent toe-down curling that would clip the floor.
    const clampAnkle = (a: number) => Math.max(ANKLE_MIN, Math.min(ANKLE_MAX, a));

    setHingeX("rUpLeg", SIGN.rHip   * q[3]);
    setHingeX("rLeg",   SIGN.rKnee  * q[4]);
    setHingeX("rFoot",  clampAnkle(SIGN.rAnkle * q[5]));

    setHingeX("lUpLeg", SIGN.lHip   * q[6]);
    setHingeX("lLeg",   SIGN.lKnee  * q[7]);
    setHingeX("lFoot",  clampAnkle(SIGN.lAnkle * q[8]));

    // Arms: spring-damper pendulum hanging from rest pose, target driven
    // by leg phase + body pitch so they swing naturally with the gait.
    const phase = q[3] - q[6];
    const torsoPitch = q[2];
    const targetR = -phase * 0.55 + torsoPitch * 0.4;
    const targetL =  phase * 0.55 + torsoPitch * 0.4;

    const s = armState.current;
    const stepPendulum = (a: number, v: number, target: number): [number, number] => {
      const accel = -ARM_K * (a - target) - ARM_DAMP * v;
      const nv = v + accel * dt;
      const na = a + nv * dt;
      return [na, nv];
    };
    [s.rA, s.rV] = stepPendulum(s.rA, s.rV, targetR);
    [s.lA, s.lV] = stepPendulum(s.lA, s.lV, targetL);

    setHingeZ("rArm", ARM_REST_R + s.rA);
    setHingeZ("lArm", ARM_REST_L + s.lA);
    setHingeX("rForeArm", FOREARM_REST);
    setHingeX("lForeArm", FOREARM_REST);

    // ── Ground clip pass: scan toe + ankle bones for the lowest world Y.
    //    If any goes below ground, lift the whole rig by the delta.
    root.current.updateMatrixWorld(true);
    let minY = Infinity;
    for (const key of ["rToe", "lToe", "rFoot", "lFoot"] as const) {
      const bone = b[key];
      if (bone) { bone.getWorldPosition(_tmpV); minY = Math.min(minY, _tmpV.y); }
    }
    const lowest = minY - FOOT_BUFFER;
    if (lowest < 0) {
      root.current.position.y += -lowest;
    }
  });

  return (
    <group ref={root} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
