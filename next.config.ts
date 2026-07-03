import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/guides", destination: "/learn", permanent: true },
      { source: "/guides/:slug", destination: "/learn/guides/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
