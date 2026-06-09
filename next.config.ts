import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
