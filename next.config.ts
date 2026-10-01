import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix Turbopack workspace root detection (project moved from /web/ to root)
  turbopack: {
    root: path.resolve("."),
  },

  // Include generated chapter JSON files in Vercel's serverless bundle
  outputFileTracingIncludes: {
    "/api/**": ["./src/data/chapters/**/*.json"],
    "/truyen/**": ["./src/data/chapters/**/*.json"],
  },

  // Allow mobile app to access API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
