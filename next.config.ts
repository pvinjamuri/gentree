import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gentree',
  images: {
    unoptimized: true,
  },
  generateBuildId: () => `build-${Date.now()}`,
};

export default nextConfig;
