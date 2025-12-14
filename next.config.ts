import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.carsales.com.au',
      },
      {
        protocol: 'https',
        hostname: '*.gumtree.com.au',
      },
      {
        protocol: 'https',
        hostname: '*.classistatic.com',
      },
    ],
  },
};

export default nextConfig;
