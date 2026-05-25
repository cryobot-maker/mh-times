"use client";

import { useEffect, useRef, useState } from "react";

interface LetterBoxedAnimatedLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity?: number;
  animate?: boolean;
}

export function LetterBoxedAnimatedLine({
  x1,
  y1,
  x2,
  y2,
  color,
  opacity = 0.6,
  animate = true,
}: LetterBoxedAnimatedLineProps) {
  const pathRef = useRef<SVGLineElement>(null);
  const [dashOffset, setDashOffset] = useState(0);
  const length = Math.hypot(x2 - x1, y2 - y1);

  useEffect(() => {
    if (!animate) {
      setDashOffset(0);
      return;
    }
    setDashOffset(length);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDashOffset(0));
    });
    return () => cancelAnimationFrame(id);
  }, [x1, y1, x2, y2, length, animate]);

  return (
    <line
      ref={pathRef}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={2}
      strokeOpacity={opacity}
      strokeDasharray={length}
      strokeDashoffset={dashOffset}
      style={{ transition: "stroke-dashoffset 200ms ease-out" }}
    />
  );
}
