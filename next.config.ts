import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["unpdf", "pdfjs-dist"],
};

export default nextConfig;
