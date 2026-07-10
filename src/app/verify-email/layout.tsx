import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Verify email",
  description: "Verify your Tenant Hawk account email.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
