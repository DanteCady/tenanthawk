"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Wrench } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const SETUP_STEPS = [
  {
    title: "Register a multi-tenant Entra app",
    body: "In Azure Portal → Microsoft Entra ID → App registrations → New registration. Set “Accounts in any organizational directory”.",
    href: "https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps",
  },
  {
    title: "Add read-only Graph permissions",
    body: "API permissions → Microsoft Graph → Application permissions: Directory.Read.All, User.Read.All, Application.Read.All, Policy.Read.All, Reports.Read.All, AuditLog.Read.All, Organization.Read.All, DeviceManagementManagedDevices.Read.All, SharePointTenantSettings.Read.All. Grant admin consent for your tenant.",
  },
  {
    title: "Create a client secret & redirect URI",
    body: `Certificates & secrets → New client secret. Authentication → Add redirect URI: ${APP_URL}/api/connect/callback`,
  },
  {
    title: "Set environment variables & restart",
    body: "Add MS_CLIENT_ID, MS_CLIENT_SECRET, and MS_REDIRECT_URI to .env, then restart pnpm dev.",
  },
] as const;

export function MicrosoftSetupGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Wrench className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-amber-950">
            Developer setup: enable live Microsoft connect
          </span>
          <span className="mt-0.5 block text-xs text-amber-800/90">
            One-time App Registration for Tenant Hawk - not per customer. See{" "}
            <code className="rounded bg-amber-100/80 px-1">SETUP.md</code>.
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-amber-700 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ol className="space-y-4 border-t border-amber-200/80 px-4 py-4">
          {SETUP_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-xs font-bold text-amber-900">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-amber-950">{step.title}</p>
                <p className="mt-0.5 text-amber-900/85">{step.body}</p>
                {"href" in step && step.href && (
                  <a
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                  >
                    Open Azure Portal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
          <pre className="overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
{`MS_CLIENT_ID=your-app-client-id
MS_CLIENT_SECRET=your-client-secret
MS_REDIRECT_URI=${APP_URL}/api/connect/callback`}
          </pre>
        </ol>
      )}
    </div>
  );
}
