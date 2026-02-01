import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for easy deployment
  output: "standalone",
  
  // Enable experimental features
  experimental: {
    // Turbopack is now stable in Next.js 16
  },
};

export default nextConfig;
