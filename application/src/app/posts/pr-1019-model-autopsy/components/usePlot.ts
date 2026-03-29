"use client";

import { useEffect, useRef } from "react";
import type * as Plot from "@observablehq/plot";

/**
 * Hook that renders an Observable Plot into a ref'd container.
 * Re-renders when deps change. Handles cleanup and resize.
 */
export function usePlot(
  makePlot: (width: number) => ReturnType<typeof Plot.plot>,
  deps: unknown[]
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const render = () => {
      const width = el.clientWidth;
      if (width === 0) return;
      const plot = makePlot(width);
      el.replaceChildren(plot);
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
