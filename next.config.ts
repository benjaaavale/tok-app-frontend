import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Skip ESLint and TypeScript checks during Docker build (already checked locally)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.tok-ai.cl",
      },
    ],
  },
};

export default nextConfig;
