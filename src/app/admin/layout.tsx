import Link from "next/link";
import {
  assertPlatformAdminHost,
  requirePlatformAdminSession,
} from "@/lib/platform/session";
import { getTenantHawkAdminUserIds } from "@/lib/platform/admin";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { SignOutButton } from "@/components/app/SignOutButton";
import { buildApexAppUrl } from "@/lib/platform/urls";

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertPlatformAdminHost();
  if (getTenantHawkAdminUserIds().length > 0) {
    await requirePlatformAdminSession();
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="app-header sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/admin" aria-label="Platform console">
            <ThemeLogo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium uppercase tracking-wider text-[var(--th-text-faint)] sm:inline">
              Platform console
            </span>
            <Link
              href={buildApexAppUrl("/")}
              className="text-sm text-[var(--th-text-muted)] hover:text-[var(--th-brand-text)]"
            >
              Marketing site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
