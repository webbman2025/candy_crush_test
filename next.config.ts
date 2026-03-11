import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname, // ensures Desktop/candy_crush is treated as root
};

export default nextConfig;
