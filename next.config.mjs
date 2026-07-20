/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      "form-data": "./src/lib/empty.js",
      asynckit: "./src/lib/empty.js",
      "combined-stream": "./src/lib/empty.js",
      "mime-types": "./src/lib/empty.js",
      "es-set-tostringtag": "./src/lib/empty.js",
      hasown: "./src/lib/empty.js",
    },
  },
  images: {
    // The optimizer's on-disk cache is unusable on exFAT (macOS writes
    // AppleDouble "._" sidecars there and /_next/image serves those 4KB
    // metadata files with an image/* content-type, so every next/image render
    // breaks). That only applies on exFAT — on APFS it works fine, and leaving
    // it off in dev meant the CMS's raw 5000x6800 uploads were decoded at full
    // size for 60px thumbnails, stalling scroll for ~180ms at a time.
    // Set NEXT_DISABLE_IMAGE_OPT=1 to restore the bypass on an exFAT checkout.
    unoptimized: process.env.NEXT_DISABLE_IMAGE_OPT === "1",
    // Broad patterns so next/image can optimize images from ANY of the S3 /
    // CloudFront hosts the CMS uses (the API CDN, the media CDN, or direct S3),
    // without it throwing "hostname not configured" and breaking image grids.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;


