import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Proxy API calls to the configured gateway — avoids CORS issues with cookies.
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_URL || "https://klodit.app";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${gatewayUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
