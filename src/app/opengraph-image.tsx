import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/site";

export const alt =
  "Tenant Hawk — Microsoft 365 and Azure tenant health scanner for admins and MSPs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0ea5e9 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: 24,
          }}
        >
          For M365 admins, MSPs &amp; IT leaders
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            lineHeight: 1.35,
            maxWidth: 820,
            opacity: 0.92,
          }}
        >
          One health score for security, license waste, expiring secrets, and tenant
          hygiene across Microsoft 365 &amp; Azure.
        </div>
      </div>
    ),
    { ...size },
  );
}
