import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./themes.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tenant Hawk | The hawk-eye view of your Microsoft 365 & Azure tenant",
  description:
    "Tenant Hawk continuously scans Microsoft 365, Entra, and Azure for security gaps, wasted license spend, expiring secrets, and hygiene issues. Get one health score you can actually fix.",
  keywords: [
    "Microsoft 365",
    "Entra",
    "Azure",
    "tenant security",
    "license optimization",
    "expiring secrets",
    "MSP",
    "M365 admin",
  ],
  openGraph: {
    title: "Tenant Hawk | Microsoft 365 & Azure tenant health, at a glance",
    description:
      "One health score for security, cost, reliability, and hygiene across your M365 and Azure tenants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tenant-hawk-theme");if(t==="light"||t==="dark"||t==="hawk")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
