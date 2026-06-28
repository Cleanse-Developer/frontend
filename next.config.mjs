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


