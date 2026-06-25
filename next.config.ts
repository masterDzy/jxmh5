import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '100.66.1.8', '101.33.215.39', 'jxmh5.ninetrust.cn'],
  turbopack: {
    // 注: .next/dev/cache 膨胀不是 turbopack 文件监听的问题,
    // 而是 dev cache 自身无限增长(SST 单文件可达 260MB+)
    // 解决方案: bin/deploy-jxmh5.sh 在 deploy 前 rm -rf .next/dev/cache
    // 见 feedback-nextjs16-alloweddevorigins.md
  },
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
