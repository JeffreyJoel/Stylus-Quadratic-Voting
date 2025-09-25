import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with TypeScript errors (but still show warnings)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
