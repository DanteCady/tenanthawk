import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/clients */
export default function WorkspacesRedirectPage() {
  redirect("/dashboard/clients");
}
