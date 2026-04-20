import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Skip TypeScript checks during Docker build (already checked locally)
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
