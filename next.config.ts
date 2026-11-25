import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["unpdf", "pdfjs-dist", "firebase-admin", "jwks-rsa", "jose"],
};

export default nextConfig;
