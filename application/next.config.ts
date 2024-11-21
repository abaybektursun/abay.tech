import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ai-chatbot"],
  webpack: (config, { isServer }) => {
    // Enhance the resolver configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      "ai-chatbot": "/packages/ai-chatbot"
    };
    
    // Ensure all TypeScript files are processed
    config.module.rules.push({
      test: /\.ts$/,
      include: [/packages\/ai-chatbot/],
      use: [{ loader: "ts-loader" }]
    });
    
    return config;
  },
};

export default nextConfig;