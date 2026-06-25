import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo tone="light" />
          <p className="text-sm text-slate-500">
            The hawk-eye view of your Microsoft 365 &amp; Azure tenant.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Tenant Hawk. Not affiliated with Microsoft.
        </p>
      </div>
    </footer>
  );
}
