"use client";

import { useEffect, useRef, useState } from "react";

interface SectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Section({ id, title, subtitle, children }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`mb-16 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      <h2 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h2>
      {subtitle && (
        <p className="text-xs text-zinc-400 mb-8">{subtitle}</p>
      )}
      {children}
    </section>
  );
}
