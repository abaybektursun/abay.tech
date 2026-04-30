"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface Episode {
  slug: string;
  label: string;
  seed: number;
  iter: number;
  score: number;
  ep_return: number;
  length: number;
  n_frames: number;
  dt: number;
  frames: number[];
}

const QPOS_DIM = 9;

/**
 * Playback hook driven by a wall-clock RAF. The current frame is fractional
 * so consumers can lerp poses for sub-step smoothness at 60+ Hz canvas
 * regardless of the simulator's 31.25 Hz step rate.
 *
 * The qpos buffer is mutated in-place inside the RAF — components that read
 * it should do so inside their own `useFrame` (R3F) tick, not in render.
 *
 * UI state (frameIdx, playing, speed) lives in React state at coarse
 * granularity (we only update frameIdx state at most ~30 Hz so the scrubber
 * doesn't burn re-renders).
 */
export function usePlayback(slug: string | null, defaultSpeed = 2) {
  const [ep, setEp] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [frameIdx, setFrameIdx] = useState(0);

  // Mutable refs so the RAF loop never causes React renders for pose updates.
  const qposRef = useRef(new Float32Array(QPOS_DIM));
  const fracIdxRef = useRef(0);
  const epRef = useRef<Episode | null>(null);
  const playingRef = useRef(true);
  const speedRef = useRef(defaultSpeed);

  // Keep refs in sync with state so the persistent RAF loop sees current values.
  useEffect(() => { epRef.current = ep; }, [ep]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Fetch episode JSON.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/data/walker2d/${slug}.json`)
      .then((r) => r.json())
      .then((j: Episode) => {
        if (cancelled) return;
        setEp(j);
        fracIdxRef.current = 0;
        setFrameIdx(0);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  // Persistent RAF loop — runs as long as the component is mounted.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastUiTick = 0;
    const tick = (t: number) => {
      const dtSec = (t - last) / 1000;
      last = t;
      const e = epRef.current;
      if (e && playingRef.current) {
        const stepsPerSec = (1 / e.dt) * speedRef.current;
        fracIdxRef.current += dtSec * stepsPerSec;
        if (fracIdxRef.current >= e.n_frames - 1) {
          fracIdxRef.current = 0; // loop
        }
        // Lerp qpos between floor and ceil into the shared buffer.
        const i0 = Math.floor(fracIdxRef.current);
        const i1 = Math.min(i0 + 1, e.n_frames - 1);
        const a = fracIdxRef.current - i0;
        const off0 = i0 * QPOS_DIM;
        const off1 = i1 * QPOS_DIM;
        for (let k = 0; k < QPOS_DIM; k++) {
          qposRef.current[k] = e.frames[off0 + k] * (1 - a) + e.frames[off1 + k] * a;
        }
        // Coarse UI tick — update state at ~20 Hz only.
        if (t - lastUiTick > 50) {
          lastUiTick = t;
          setFrameIdx(i0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const seek = useCallback(
    (f: number) => {
      const e = epRef.current;
      if (!e) return;
      const clamped = Math.max(0, Math.min(e.n_frames - 1, f));
      fracIdxRef.current = clamped;
      setFrameIdx(Math.floor(clamped));
    },
    []
  );

  return {
    ep,
    loading,
    error,
    playing,
    speed,
    frameIdx,
    qpos: qposRef.current,
    play,
    pause,
    toggle,
    setSpeed,
    seek,
  };
}
