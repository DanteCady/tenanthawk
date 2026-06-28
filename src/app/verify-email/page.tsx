import { redirect } from "next/navigation";

/** Email links land here; forward to Better Auth to verify the token and set session. */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackURL?: string }>;
}) {
  const { token, callbackURL } = await searchParams;
  if (!token) redirect("/login");

  const params = new URLSearchParams({ token });
  params.set("callbackURL", callbackURL ?? "/check-email");
  redirect(`/api/auth/verify-email?${params.toString()}`);
}
