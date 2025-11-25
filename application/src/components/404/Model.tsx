'use client';
import { useGLTF, Text, Float } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export default function Model() {
  const { viewport } = useThree();
  const { nodes } = useGLTF('/medias/shards.glb') as any;

  return (
    <group scale={viewport.width / 1.5}>
      {nodes.Scene.children.map((mesh: any, i: number) => (
        <Mesh data={mesh} key={i} />
      ))}
      <Text
        position={[0, 0, -0.1]}
        fontSize={0.4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        404
      </Text>
    </group>
  );
}

function Mesh({ data }: any) {
  return (
    <Float>
      <mesh {...data}>
        <meshPhysicalMaterial
          transparent
          opacity={0.3}
          color="#ffffff"
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={0.5}
          envMapIntensity={1}
          side={2}
        />
      </mesh>
    </Float>
  );
}