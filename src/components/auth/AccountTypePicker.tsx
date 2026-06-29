"use client";

import type { AccountType } from "@/lib/onboarding/account-type";
import { Building2, User } from "lucide-react";

const options: {
  type: AccountType;
  title: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    type: "individual",
    title: "IT admin or security lead",
    description: "Scan and monitor your own Microsoft 365 tenant.",
    icon: User,
  },
  {
    type: "msp",
    title: "MSP or consultant",
    description: "Manage multiple client tenants with a branded workspace.",
    icon: Building2,
  },
];

export function AccountTypePicker({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (type: AccountType) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">I am signing up as…</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.type;
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/25"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    selected ? "text-blue-600" : "text-slate-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
