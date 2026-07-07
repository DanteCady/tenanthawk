import Link from "next/link";
import { UserAvatar } from "@/components/app/UserAvatar";
import { SidebarTooltip } from "./SidebarTooltip";

export function SidebarUserProfile({
  name,
  email,
  image,
  collapsed,
  onNavigate,
}: {
  name: string;
  email: string;
  image?: string | null;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const displayName = name.trim() || email.split("@")[0] || "Account";

  const profile = (
    <Link
      href="/dashboard/settings"
      onClick={onNavigate}
      className={`nav-link flex min-w-0 items-center gap-2.5 rounded-lg transition-colors ${
        collapsed ? "justify-center p-2" : "px-2 py-2"
      }`}
      aria-label={`${displayName}, account settings`}
    >
      <UserAvatar name={name} email={email} image={image} size={collapsed ? "sm" : "md"} />
      {!collapsed ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-[var(--th-text)]">
            {displayName}
          </span>
          <span className="block truncate text-xs text-[var(--th-text-faint)]">{email}</span>
        </span>
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <SidebarTooltip enabled label={displayName}>
        {profile}
      </SidebarTooltip>
    );
  }

  return profile;
}
