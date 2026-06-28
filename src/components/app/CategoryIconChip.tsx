import { CATEGORY_CHIP, CATEGORY_META } from "@/components/app/categories";
import type { Category } from "@/db/types";

export function CategoryIconChip({
  category,
  size = "sm",
}: {
  category: Category;
  size?: "sm" | "md";
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const styles = CATEGORY_CHIP[category];
  const box = size === "md" ? "h-8 w-8 rounded-lg" : "h-7 w-7 rounded-md";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${box} ${styles.chip} ${styles.icon}`}
      aria-hidden
    >
      <Icon className={icon} />
    </span>
  );
}

export function CategoryLabel({
  category,
  size = "sm",
}: {
  category: Category;
  size?: "sm" | "md";
}) {
  const meta = CATEGORY_META[category];
  return (
    <span className="inline-flex items-center gap-2">
      <CategoryIconChip category={category} size={size} />
      <span>{meta.label}</span>
    </span>
  );
}
