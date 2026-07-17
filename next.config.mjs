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
    // DEV ONLY: skip the image optimizer. Its on-disk cache is unusable when the
    // repo lives on an exFAT volume (macOS writes AppleDouble "._" sidecars
    // there, and /_next/image then serves those 4KB metadata files with an
    // image/* content-type, so every next/image render is a broken image).
    // Production still optimizes normally.
    unoptimized: process.env.NODE_ENV === "development",
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


