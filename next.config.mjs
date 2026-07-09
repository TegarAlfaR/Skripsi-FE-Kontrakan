/** @type {import('next').NextConfig} */

// Import dulu next-pwa-nya
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

// Gabungkan keduanya
export default withPWA(nextConfig);
