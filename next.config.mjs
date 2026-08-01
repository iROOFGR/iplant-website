import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Dev and build write to separate directories.
 *
 * Sharing `.next` between them means running `next build` while `next dev` is
 * live overwrites the running server's chunks, and it starts throwing
 * `Cannot find module './vendor-chunks/*.js'` on every request. It looks like
 * the site is broken when nothing is wrong with the code. Splitting the
 * directories makes that failure impossible rather than something you have to
 * remember not to do.
 */
const distDir = process.env.NODE_ENV === "development" ? ".next-dev" : ".next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  distDir,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1920, 2560],
    imageSizes: [160, 240, 320, 480, 640],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/media/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=7776000" },
        ],
      },
    ];
  },
};

export default nextConfig;
