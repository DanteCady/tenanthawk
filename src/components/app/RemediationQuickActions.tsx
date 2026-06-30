"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Terminal } from "lucide-react";
import {
  getPortalLinksForCheck,
  getPowerShellForCheck,
} from "@/lib/remediation/portal-links";

export function RemediationQuickActions({ checkId }: { checkId: string }) {
  const links = getPortalLinksForCheck(checkId);
  const powershell = getPowerShellForCheck(checkId);
  const [copied, setCopied] = useState(false);

  if (links.length === 0 && !powershell) return null;

  async function copyScript() {
    if (!powershell) return;
    try {
      await navigator.clipboard.writeText(powershell.script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked
    }
  }

  return (
    <div className="remediation-quick-actions space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-medium text-slate-600">Quick actions</p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              {link.label}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ))}
        </div>
      )}
      {powershell && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Terminal className="h-3.5 w-3.5" />
              {powershell.label}
            </span>
            <button
              type="button"
              onClick={() => void copyScript()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.65rem] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy script
                </>
              )}
            </button>
          </div>
          <pre className="max-h-28 overflow-auto rounded-md border border-slate-200 bg-slate-900 p-2.5 text-[0.65rem] leading-relaxed text-slate-100">
            {powershell.script}
          </pre>
        </div>
      )}
    </div>
  );
}
