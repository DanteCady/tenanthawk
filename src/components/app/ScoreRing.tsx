"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { grade } from "@/lib/scan/score";
import { GradeBadge } from "./GradeBadge";

export function ScoreRing({
  score,
  size = 160,
  showGrade = true,
}: {
  score: number;
  size?: number;
  /** Hide the grade pill under the ring (compact list rows). */
  showGrade?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const gradientId = useId();

  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const letter = grade(score);
  const scoreText =
    size >= 140 ? "text-4xl" : size >= 110 ? "text-3xl" : "text-2xl";

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, score, {
      duration: 1.3,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, score]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center ${showGrade ? "gap-1.5" : ""}`}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={inView ? { strokeDashoffset: circ - (score / 100) * circ } : {}}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2={size} y2={size}>
              <stop stopColor="#60a5fa" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold tabular-nums text-slate-900 ${scoreText}`}>
            {display}
          </span>
        </div>
      </div>
      {showGrade ? (
        <GradeBadge letter={letter} size={size >= 130 ? "md" : "sm"} />
      ) : null}
    </div>
  );
}
