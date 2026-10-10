import type { NextConfig } from "next";

/** Uploaded photos are served from MEDIA_PUBLIC_URL (the R2 bucket's public domain). */
function mediaPattern() {
  const base = process.env.MEDIA_PUBLIC_URL;
  if (!base) return [];
  const url = new URL(base);
  return [{ protocol: url.protocol.replace(":", "") as "https" | "http", hostname: url.hostname, pathname: `${url.pathname.replace(/\/$/, "")}/**` }];
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" }, ...mediaPattern()],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
