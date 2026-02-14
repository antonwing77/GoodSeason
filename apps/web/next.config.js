/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@seasonscope/shared', '@seasonscope/ui'],
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  // Performance
  poweredByHeader: false,
  compress: true,
  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
