import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '100.66.1.8', '101.33.215.39', 'jxmh5.ninetrust.cn'],
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@jmaui": path.resolve(__dirname, "src/components/jmaui"),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8009/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
