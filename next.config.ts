import type { NextConfig } from "next";

/** Offer and shop photos come from the API's media host (MEDIA_PUBLIC_URL). */
const mediaUrl = process.env.MEDIA_PUBLIC_URL ? new URL(process.env.MEDIA_PUBLIC_URL) : null;

function mediaPattern() {
  if (!mediaUrl) return [];
  return [
    {
      protocol: mediaUrl.protocol.replace(":", "") as "https" | "http",
      hostname: mediaUrl.hostname,
      ...(mediaUrl.port && { port: mediaUrl.port }),
      pathname: `${mediaUrl.pathname.replace(/\/$/, "")}/**`,
    },
  ];
}

/** A local API in development serves its media from localhost, which next/image refuses unless allowed. */
const localMedia = process.env.NODE_ENV !== "production" && (mediaUrl?.hostname === "localhost" || mediaUrl?.hostname === "127.0.0.1");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // A page's prerendered shell is stored with its "use cache" data, which Next deflates and
    // inflates with a 500 MB output limit. Cloudflare Workers' zlib refuses that limit with a
    // RangeError, so the per-request part of every page that read cached API data never
    // rendered and the response hung. Stored as plain JSON instead (a little more R2 space).
    disableResumeDataCacheCompression: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" }, ...mediaPattern()],
    ...(localMedia && { dangerouslyAllowLocalIP: true }),
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
