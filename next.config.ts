import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
    unoptimized: true
  },
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  experimental: {
    esmExternals: false,
  },
  devIndicators: false,
};

export default nextConfig;
