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
  experimental: {
    missingSuspenseWithCsrBailout: false,
  },
  // Trick the browser: Proxy API calls directly to the Docker container!
  async rewrites() {
    return[
      {
        source: '/api/v1/:path*',
        destination: 'http://api-gateway:3000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;