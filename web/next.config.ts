import type { NextConfig } from "next";

const nextConfig: any = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.mixkit.co',
      },
      {
        protocol: 'https',
        hostname: 'rsqaszyngyxkwkunwvxf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.30', 'localhost:3000', 'localhost:3001'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.ADMIN_API_URL || 'http://localhost:3001'}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
