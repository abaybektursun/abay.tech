import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    // Add custom webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      'ai-chatbot': './packages/ai-chatbot'
    };

    return config;
  },
  async redirects() {
    return [
      {
        source: '/blog/2018/07/01/why-does-batch-normalization-work',
        destination: '/posts/why-does-batch',
        permanent: true,
      },
      {
        source: '/blog/2023/07/08/unseen-opportunities-mining-upwork-with-gpt',
        destination: '/posts/upwork',
        permanent: true,
      },
    ]
  }
};

export default nextConfig;