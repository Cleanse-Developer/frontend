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
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
