'use client';

import { useEffect, useState, type ReactNode } from 'react';
import 'react-grid-layout/css/styles.css';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface DynamicGridProps {
  layouts: Record<string, LayoutItem[]>;
  onLayoutChange: (layout: LayoutItem[], allLayouts: Record<string, LayoutItem[]>) => void;
  children: ReactNode;
}

export function DynamicGrid({ layouts, onLayoutChange, children }: DynamicGridProps) {
  const [GridComponent, setGridComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamic import only on client side
    import('react-grid-layout').then((mod) => {
      // Access exports from the CommonJS module - use type assertion for runtime access
      const RGL = mod as any;
      const WidthProvider = RGL.WidthProvider || RGL.default?.WidthProvider;
      const Responsive = RGL.Responsive || RGL.default?.Responsive;

      if (WidthProvider && Responsive) {
        setGridComponent(() => WidthProvider(Responsive));
      }
    });
  }, []);

  if (!GridComponent) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    );
  }

  return (
    <GridComponent
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={40}
      onLayoutChange={onLayoutChange}
      draggableHandle=".grid-drag-handle"
      isResizable
      isDraggable
      margin={[16, 16]}
    >
      {children}
    </GridComponent>
  );
}
