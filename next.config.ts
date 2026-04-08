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
    unoptimized: true, // Required for GitHub Pages static export
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
  // Use 'export' and set basePath ONLY when running in GitHub Actions.
  // This keeps the AI Studio preview working ('standalone') while deploying correctly to GitHub Pages.
  output: process.env.GITHUB_ACTIONS ? 'export' : 'standalone',
  basePath: process.env.GITHUB_ACTIONS ? '/Ma-Research-Portal' : '',
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
