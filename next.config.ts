import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hostable build output (see Dockerfile guidance in the README).
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Baseline hardening for every response. A strict CSP is
        // deliberately deferred: Next's inline bootstrap and the
        // /pixel.js route would both need nonce plumbing first
        // (tracked in the PAD known-issues table).
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // R7-P1: the live sends HSTS on both surfaces; matched here. Only
          // meaningful over HTTPS — proxies/hosts terminate TLS upstream.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
