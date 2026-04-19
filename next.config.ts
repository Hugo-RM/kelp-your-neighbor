import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid `.next` in OneDrive-backed folders on Windows because it can become
  // a reparse point, which breaks Next's readlink/lstat steps.
  distDir: "next-build",
  experimental: {
    // Prefer an in-process build path in constrained Windows environments.
    webpackBuildWorker: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Strict Mode double-invokes effects in dev, which causes Leaflet to error
  // with "Map container is already initialized" on the same DOM node.
  // Production builds are unaffected — Strict Mode never runs in prod.
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
