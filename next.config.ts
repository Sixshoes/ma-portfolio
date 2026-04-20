import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remote hosts for journal thumbnails, profile photo, and portal assets.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sixshoes.github.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ars.els-cdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pubs.acs.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pubs.rsc.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'advanced.onlinelibrary.wiley.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
