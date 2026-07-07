function initialsFromLabel(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function avatarHue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
} as const;

export function UserAvatar({
  name,
  email,
  image,
  size = "md",
}: {
  name: string;
  email: string;
  image?: string | null;
  size?: keyof typeof sizeClasses;
}) {
  const label = name.trim() || email;
  const initials = initialsFromLabel(name, email);
  const hue = avatarHue(label);

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover ring-2 ring-[var(--th-sidebar-border)]`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${sizeClasses[size]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-[var(--th-sidebar-border)]`}
      style={{ backgroundColor: `hsl(${hue} 52% 42%)` }}
    >
      {initials}
    </span>
  );
}
