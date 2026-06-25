import { gradeStyles } from "@/lib/scan/score";

export function GradeBadge({
  letter,
  size = "md",
}: {
  letter: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "min-w-[2.75rem] px-3 py-1 text-xl"
      : size === "sm"
        ? "px-2 py-0.5 text-xs"
        : "px-2.5 py-0.5 text-sm";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold ring-1 ring-inset ${sizeClass} ${gradeStyles(letter)}`}
    >
      {letter}
    </span>
  );
}
