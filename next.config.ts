import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.202'],
  images: {
    localPatterns: [
      {
        pathname: '/assets/**',
        search: '',
      },
      {
        pathname: '/assets/Logos-*.png',
        search: '?v=20260608',
      },
    ],
  },
};

export default nextConfig;
