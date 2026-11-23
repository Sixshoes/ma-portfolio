import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sixshoes.github.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
};

export default nextConfig;
