'use client';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-black/40 text-xl animate-pulse">Loading 3D Scene...</div>
    </div>
  ),
});

export default function ThreeWrapper() {
  return <Scene />;
}