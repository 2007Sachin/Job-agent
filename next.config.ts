import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["unpdf", "pdfjs-dist", "firebase-admin"],
};

export default nextConfig;
