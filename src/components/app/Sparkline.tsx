"use client";

import { useEffect, useRef, useState } from "react";

export function Sparkline({
  points,
  width = 140,
  height = 40,
  className = "",
  color = "#2563eb",
  domainMin,
  domainMax,
}: {
  points: number[];
  width?: number | string;
  height?: number;
  className?: string;
  /** Stroke and dot color. */
  color?: string;
  /** Fixed y-axis min (e.g. 0 for scores). */
  domainMin?: number;
  /** Fixed y-axis max (e.g. 100 for scores). */
  domainMax?: number;
}) {
  const fluid = width === "100%";
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(200);

  useEffect(() => {
    if (!fluid) return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setMeasuredWidth(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fluid]);

  const numericWidth =
    fluid ? measuredWidth : typeof width === "number" ? width : 200;

  if (points.length < 2) {
    return (
      <div
        ref={fluid ? containerRef : undefined}
        className={`flex items-center justify-center text-xs text-slate-400 ${className}`}
        style={fluid ? { height } : { width, height }}
      >
        Not enough history yet
      </div>
    );
  }

  const min = domainMin ?? Math.min(...points, 0);
  const max = domainMax ?? Math.max(...points, 100);
  const range = max - min || 1;
  const stepX = numericWidth / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y] as const;
  });

  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [lastX, lastY] = coords[coords.length - 1];
  const baseline = height;
  const areaPath = `${path} L ${lastX.toFixed(1)} ${baseline} L 0 ${baseline} Z`;
  const gradientId = `spark-${color.replace("#", "")}`;

  const svg = (
    <svg
      width={fluid ? "100%" : width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  );

  if (fluid) {
    return (
      <div ref={containerRef} className={`w-full ${className}`} style={{ height }}>
        {svg}
      </div>
    );
  }

  return <div className={className}>{svg}</div>;
}
