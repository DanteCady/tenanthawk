import { redirect } from "next/navigation";
import { WorkspaceOnboardingStep } from "@/components/onboarding/WorkspaceOnboardingStep";
import { getEnterpriseRootDomain } from "@/lib/enterprise/config";
import { getOwnedEnterpriseOrganization } from "@/lib/enterprise/workspace";
import { getUserAccountType } from "@/lib/onboarding/user-account";
import { requireVerifiedSession } from "@/lib/session";

export default async function WorkspaceOnboardingPage() {
  const session = await requireVerifiedSession();
  const accountType = await getUserAccountType(session.user.id);

  if (accountType !== "msp") {
    redirect("/onboarding");
  }

  const existing = await getOwnedEnterpriseOrganization(session.user.id);
  if (existing) {
    redirect("/onboarding");
  }

  const rootDomain = getEnterpriseRootDomain().split(":")[0] ?? getEnterpriseRootDomain();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <WorkspaceOnboardingStep
        defaultName={session.user.name?.trim() || session.user.email.split("@")[0] || "My MSP"}
        rootDomain={rootDomain}
      />
    </div>
  );
}
