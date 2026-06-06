/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year for optimized images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.martynachojnacka.com",
        pathname: "/images/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Next.js optimized images
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Static assets in /public
        source: "/(.*\\.(?:webp|jpg|jpeg|png|gif|svg|mp4|webm|js|css|woff2?))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
