import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["202.66.172.182"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/trade-data", permanent: false }];
  },
};

export default nextConfig;
