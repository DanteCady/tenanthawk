"use client";

import { Tooltip } from "@/components/ui/Tooltip";

/** Sidebar icon tooltip — shorthand for right-placed label tooltips. */
export function SidebarTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label} enabled={enabled} placement="right" wrapClassName="block w-full">
      {children}
    </Tooltip>
  );
}
