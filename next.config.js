/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.martynachojnacka.com",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;