/** Hawk mark + app tile for ImageResponse (next/og) - no DOM-only APIs. */

const HAWK_HEAD =
  "M 15 24 C 16 16 26 12 36 16 C 41 18 44 20 46 23 C 50 24 54 27 56 33 L 57 39 L 49 36 C 52 33 49 32 45 32 L 41 33 C 38 40 32 45 26 44 C 22 43 18 40 17 35 C 14 33 13 30 15 24 Z";

const HAWK_EYE = "M 36 24 C 39 22 43 23 45 25 C 42 27 38 26 36 24 Z";

export function OgHawkMark({
  size,
  gradientId = "og-hawk",
}: {
  size: number;
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="12"
          x2="56"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fcd34d" />
          <stop stopColor="#f59e0b" offset="0.55" />
          <stop stopColor="#b45309" offset="1" />
        </linearGradient>
      </defs>
      <g transform="translate(2 4) scale(0.92)">
        <path d={HAWK_HEAD} fill={`url(#${gradientId})`} />
        <path d={HAWK_EYE} fill="#0b1120" />
      </g>
    </svg>
  );
}

export function OgAppIcon({ size }: { size: number }) {
  const radius = Math.round(size * 0.234);
  const border = Math.max(2, Math.round(size * 0.031));

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(135deg, #1a2438 0%, #070b14 100%)",
        border: `${border}px solid #2a3650`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
      }}
    >
      <OgHawkMark size={Math.round(size * 0.62)} gradientId={`hawk-${size}`} />
    </div>
  );
}

export function OgBrandLayout({
  title,
  subtitle,
  eyebrow = "For M365 admins, MSPs & IT leaders",
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
}) {
  const categories = [
    { label: "Security", color: "#ef4444" },
    { label: "Cost", color: "#22c55e" },
    { label: "Reliability", color: "#3b82f6" },
    { label: "Hygiene", color: "#eab308" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(145deg, #070b14 0%, #0b1120 45%, #111a2e 100%)",
        color: "#e6edf7",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <OgAppIcon size={88} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#e6edf7",
              }}
            >
              <span>Tenant</span>
              <span style={{ color: "#fbbf24" }}>Hawk</span>
            </div>
            <span style={{ fontSize: 18, color: "#94a3b8", marginTop: 4 }}>
              tenanthawk.io
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#64748b",
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 620,
            color: "#f8fafc",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 26,
            lineHeight: 1.4,
            maxWidth: 580,
            color: "#94a3b8",
          }}
        >
          {subtitle}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
          {categories.map((c) => (
            <span
              key={c.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 16,
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: c.color,
                }}
              />
              <span>{c.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          width: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background:
            "linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(59,130,246,0.06) 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(17, 26, 46, 0.9)",
            padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
            Tenant health score
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#f59e0b",
            }}
          >
            72
          </div>
          <div style={{ fontSize: 15, color: "#94a3b8", marginTop: 4 }}>
            contoso.onmicrosoft.com
          </div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "3 secrets expiring", color: "#ef4444" },
              { label: "$1,840/mo license waste", color: "#22c55e" },
              { label: "CA policy drift detected", color: "#3b82f6" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  color: "#cbd5e1",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
