import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress react-pdf warnings
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
