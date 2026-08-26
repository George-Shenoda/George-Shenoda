import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@portfolio/shared"],
  ...(process.env.ELECTRON_BUILD === "true" ? { output: "standalone" } : {}),
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    unoptimized: true,
    domains: ["placehold.co"],
  },
};

export default nextConfig;
