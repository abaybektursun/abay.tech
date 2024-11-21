import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add custom webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      'ai-chatbot': './packages/ai-chatbot'
    };

    return config;
  },
};

export default nextConfig;