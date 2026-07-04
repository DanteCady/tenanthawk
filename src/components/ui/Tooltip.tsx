"use client";

import type { ReactNode } from "react";

export function Tooltip({
  content,
  label,
  placement = "right",
  enabled = true,
  wrapClassName = "",
  children,
}: {
  content?: ReactNode;
  label?: string;
  placement?: "right" | "bottom";
  enabled?: boolean;
  wrapClassName?: string;
  children: ReactNode;
}) {
  if (!enabled || (!content && !label)) return <>{children}</>;

  return (
    <div
      className={`app-tooltip-wrap group/tooltip relative inline-flex max-w-full ${wrapClassName}`}
    >
      {children}
      <span
        className={`app-tooltip app-tooltip--${placement}`}
        role="tooltip"
      >
        {content ?? label}
      </span>
    </div>
  );
}
