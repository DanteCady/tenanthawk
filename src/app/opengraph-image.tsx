import { ImageResponse } from "next/og";
import { OgBrandLayout } from "@/lib/brand/image-mark";
import { OG_IMAGE_ALT } from "@/lib/seo/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgBrandLayout
        title="Microsoft 365 & Azure tenant health scanner"
        subtitle="One health score for security, license waste, expiring secrets, and tenant hygiene — read-only, no agents."
      />
    ),
    { ...size },
  );
}
