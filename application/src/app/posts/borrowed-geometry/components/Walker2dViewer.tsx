"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Grid,
  AdaptiveDpr,
  AdaptiveEvents,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { CharacterRig } from "./CharacterRig";
import { usePlayback } from "./usePlayback";

// Best episode across the n=3 walker2d runs (s2024 at iter 80k, score 79.1).
const EPISODE_SLUG = "best-s2024";
const EPISODE_LABEL = "Walker2d-medium-v2";
const EPISODE_SCORE = 79.1;

export default function Walker2dViewer() {
  const playback = usePlayback(EPISODE_SLUG, 2);

  return (
    <div className="overflow-hidden border border-[--rule]">
      <div className="relative bg-[#070912]" style={{ aspectRatio: "16/9" }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [4, 1.5, 5], fov: 32 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Scene qposRef={{ current: playback.qpos }} ready={!!playback.ep} />
        </Canvas>

        <div className="absolute inset-0 pointer-events-none p-5 flex items-start justify-between">
          <div>
            <div className="t-eyebrow" style={{ color: "#6E7585" }}>{EPISODE_LABEL}</div>
          </div>
          <div className="text-right">
            <div className="t-eyebrow" style={{ color: "#6E7585" }}>norm. score</div>
            <div className="t-numeral mt-1" style={{ color: "#E8512F", fontSize: 44, lineHeight: 1, textShadow: "0 0 16px rgba(232,81,47,0.45)" }}>
              {EPISODE_SCORE.toFixed(1)}
            </div>
          </div>
        </div>

        {playback.loading && (
          <div className="absolute inset-0 flex items-center justify-center text-[#6E7585] t-eyebrow">
            loading trajectory
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[--surface] border-t border-[--rule] px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button onClick={playback.toggle} className="t-seg" aria-label={playback.playing ? "pause" : "play"}>
          {playback.playing ? "pause" : "play"}
        </button>
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => playback.setSpeed(s)} data-active={playback.speed === s} className="t-seg">
            {s}×
          </button>
        ))}
        <input
          type="range"
          min={0}
          max={(playback.ep?.n_frames ?? 1) - 1}
          value={playback.frameIdx}
          onChange={(e) => playback.seek(Number(e.target.value))}
          className="walker-scrubber flex-1 min-w-[120px]"
        />
        <span className="t-data" style={{ color: "var(--ink-3)" }}>
          {playback.frameIdx} / {playback.ep?.n_frames ?? 0}
        </span>
      </div>

      <style jsx>{`
        .walker-scrubber {
          appearance: none;
          height: 1px;
          background: var(--rule);
          outline: none;
        }
        .walker-scrubber::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--surface);
          cursor: pointer;
        }
        .walker-scrubber::-moz-range-thumb {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--surface);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* ── Inside-Canvas scene ─────────────────────────────────────────────── */

interface SceneProps {
  qposRef: { current: Float32Array };
  ready: boolean;
}

function Scene({ qposRef, ready }: SceneProps) {
  return (
    <>
      {/* atmosphere */}
      <color attach="background" args={["#070912"]} />
      <fog attach="fog" args={["#070912", 6, 22]} />

      {/* gradient sky (radial dome behind everything) */}
      <SkyDome />

      {/* lighting — three-point with copper rim */}
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.6}
        color="#f6efe2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {/* fill — cool */}
      <directionalLight position={[-4, 4, -3]} intensity={0.45} color="#5a8aa8" />
      {/* rim — vermilion accent backlight */}
      <directionalLight position={[-2, 3, -6]} intensity={1.6} color="#e8512f" />
      {/* low ground bounce */}
      <hemisphereLight args={["#3a4660", "#0a0d18", 0.35]} />

      <Suspense fallback={null}>
        <Environment preset="night" environmentIntensity={0.25} />
      </Suspense>

      <Floor />

      {ready && (
        <Suspense fallback={null}>
          <FollowingCharacter qposRef={qposRef} />
        </Suspense>
      )}

      <ContactShadows position={[0, 0.005, 0]} opacity={0.6} scale={14} blur={2.6} far={3} />

      {/* post-processing */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.45} luminanceThreshold={0.65} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

/* Camera-following wrapper. Moves the rig forward AND repositions camera
 * with a fixed offset so the character stays centered while the floor grid
 * slides past — no smoothing, no drama, no "travel". */
function FollowingCharacter({ qposRef }: { qposRef: { current: Float32Array } }) {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    const q = qposRef.current;
    if (!q) return;
    camera.position.x = q[0] + 4;
    camera.position.y = 1.5;
    camera.position.z = 5;
    camera.lookAt(q[0], 0.95, 0);
  });
  return <CharacterRig qposRef={qposRef} />;
}

/* Floor — large dark plane + dual-pulse infinite grid + emissive horizon strip. */
function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 80]} />
        <meshStandardMaterial color="#0B0F1A" roughness={0.92} metalness={0.05} />
      </mesh>
      <Grid
        position={[0, 0.001, 0]}
        args={[60, 14]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#181F30"
        sectionSize={2}
        sectionThickness={0.9}
        sectionColor="#3A4A6A"
        fadeDistance={20}
        fadeStrength={1.2}
        infiniteGrid
      />
      {/* horizon emissive line — gives bloom a target far in the distance */}
      <mesh position={[0, 0.05, -16]}>
        <planeGeometry args={[80, 0.02]} />
        <meshBasicMaterial color="#e8512f" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* Subtle radial gradient skybox using a back-side sphere. */
function SkyDome() {
  const ref = useRef<{ position: { x: number } } | null>(null);
  return (
    <mesh ref={ref as never} position={[0, 0, 0]} renderOrder={-1}>
      <sphereGeometry args={[60, 32, 16]} />
      <shaderMaterial
        side={1 /* THREE.BackSide */}
        uniforms={{}}
        vertexShader={`
          varying vec3 vWorld;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `}
        fragmentShader={`
          varying vec3 vWorld;
          void main() {
            float h = clamp(vWorld.y / 50.0 + 0.3, 0.0, 1.0);
            // deep navy at horizon, near-black at zenith, hint of warmth low
            vec3 zenith = vec3(0.027, 0.035, 0.072);
            vec3 horizon = vec3(0.06, 0.07, 0.13);
            vec3 warm = vec3(0.20, 0.08, 0.05);
            float warmth = smoothstep(-0.1, 0.18, h) - smoothstep(0.18, 0.45, h);
            vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.85, h)) + warm * warmth * 0.18;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}
