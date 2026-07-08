import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 1080, 1920, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default config;
