"use client";

import { useEffect, useRef } from "react";

/**
 * Render an Observable Plot chart inside a container, redrawing on resize.
 * `make` returns a fresh HTMLElement (typically `Plot.plot({...})`).
 */
export function usePlotResize(
  make: (width: number) => HTMLElement | SVGElement,
  deps: unknown[] = []
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let current: HTMLElement | SVGElement | null = null;

    const draw = () => {
      const w = el.clientWidth;
      if (current) current.remove();
      current = make(w);
      el.append(current);
    };
    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (current) current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
