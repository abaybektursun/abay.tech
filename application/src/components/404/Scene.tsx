'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Model from './Model';

export default function Scene() {
  return (
    <Canvas
      orthographic
      style={{ background: '#ffffff' }}
      camera={{ position: [0, 0, 1], zoom: 800 }}
    >
      <Suspense fallback={null}>
        <Model />
        <directionalLight intensity={5} position={[0, 0, 5]} />
        <directionalLight intensity={3} position={[5, 0, 2]} />
        <directionalLight intensity={3} position={[-5, 0, 2]} />
        <ambientLight intensity={0.5} />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}