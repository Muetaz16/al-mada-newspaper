import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'rsqaszyngyxkwkunwvxf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // @ts-ignore - this is a dev-only property used by Next.js 15+ to allow IP-based HMR
  allowedDevOrigins: ['192.168.1.30', 'localhost:3000', 'localhost:3001'],
};

export default nextConfig;
