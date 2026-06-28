import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/** Redirect unauthenticated or unverified users away from protected app routes. */
export async function requireVerifiedSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.emailVerified) {
    const email = encodeURIComponent(session.user.email);
    redirect(`/check-email?email=${email}`);
  }
  return session;
}
