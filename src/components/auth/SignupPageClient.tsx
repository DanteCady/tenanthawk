"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { AccountTypePicker } from "@/components/auth/AccountTypePicker";
import type { AccountType } from "@/lib/onboarding/account-type";

export function SignupPageClient({
  initialAccountType,
}: {
  initialAccountType: AccountType;
}) {
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);

  return (
    <AuthShell
      title="Start your free scan"
      subtitle={
        accountType === "msp"
          ? "Create your MSP account, verify email, then set up your branded workspace."
          : "Create an account, verify your email, then connect your Microsoft 365 tenant."
      }
    >
      <div className="space-y-5">
        <AccountTypePicker value={accountType} onChange={setAccountType} />
        <AuthForm mode="signup" accountType={accountType} />
      </div>
    </AuthShell>
  );
}
