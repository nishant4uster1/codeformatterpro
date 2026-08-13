/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — required for Cloudflare Pages (and any static CDN).
  // Every tool runs client-side, so no server runtime is needed. This produces
  // an `out/` folder of pre-rendered pages that Cloudflare serves directly,
  // which fixes the "Hello World" placeholder shown on the subdomain.
  output: 'export',
  allowedDevOrigins: ['*.preview.emergentagent.com', '*.emergentcf.cloud', '*.preview.emergentagent.net'],
  images: {
    // next/image optimisation needs a server; disable it for static export.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
