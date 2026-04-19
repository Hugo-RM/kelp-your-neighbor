import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict Mode double-invokes effects in dev, which causes Leaflet to error
  // with "Map container is already initialized" on the same DOM node.
  // Production builds are unaffected — Strict Mode never runs in prod.
  reactStrictMode: false,
};

export default nextConfig;
