import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hostable build output (see Dockerfile guidance in the README).
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
