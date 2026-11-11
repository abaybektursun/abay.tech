import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingExcludes: {
    '*': ['.open-next/**'],
  },
  transpilePackages: [
    'three',
    'hast-util-to-text',
    'rehype-katex',
    'streamdown',
  ],
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
  },
  async rewrites() {
    return [
      {
        source: '/april_28_2026_gevity',
        destination: '/april_28_2026_gevity/index.html',
      },
      {
        source: '/april_28_2026_gevity/',
        destination: '/april_28_2026_gevity/index.html',
      },
    ]
  }
};

export default nextConfig;