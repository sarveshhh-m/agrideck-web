import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: {
    // Fix for workspace root warning with multiple lockfiles
    outputFileTracingRoot: path.join(__dirname),
  },
};

export default nextConfig;
