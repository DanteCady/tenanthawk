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
        title="M365 tenant cleanup tool & health overview"
        subtitle="Find inactive users, unused licenses, security gaps, and hygiene drift — one read-only scan, one health score."
      />
    ),
    { ...size },
  );
}
