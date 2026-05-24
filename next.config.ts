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
  // Proxy API calls to the gateway — avoids CORS issues with cookies
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return[
      {
        source: '/api/v1/:path*',
        destination: `${gatewayUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;