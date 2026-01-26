import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone', // For optimized deployment
  images: {
    unoptimized: true, // Allow all external image URLs without optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd32trhawgfkkkj.cloudfront.net',
      },
      // Common hosts used for uploaded assets or external CDN providers
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  // When true, Next.js will not run ESLint during `next build`.
  // This helps avoid CI/build failures caused by lint rules you prefer to enforce only during development.
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
