import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPlatformAdminUser } from "@/lib/platform/admin";
import { requireVerifiedSession } from "@/lib/session";

export async function requirePlatformAdminSession() {
  const session = await requireVerifiedSession();
  if (!isPlatformAdminUser(session.user.id)) {
    redirect("/login?error=not-authorized");
  }
  return session;
}

export async function assertPlatformAdminHost() {
  const { parseHostContext } = await import("@/lib/platform/admin");
  const host = (await headers()).get("host");
  const ctx = parseHostContext(host);
  if (ctx.kind !== "platform-admin") {
    const { buildPlatformAdminUrl } = await import("@/lib/platform/admin");
    redirect(buildPlatformAdminUrl("/"));
  }
}
