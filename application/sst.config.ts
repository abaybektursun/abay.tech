/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "abay-tech",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const groqApiKey = new sst.Secret("GROQ_API_KEY");
    const openaiApiKey = new sst.Secret("OPENAI_API_KEY");

    new sst.aws.Nextjs("abay", {
      domain: "abay.tech",
      link: [groqApiKey, openaiApiKey],
      environment: {
        GROQ_API_KEY: groqApiKey.value,
        OPENAI_API_KEY: openaiApiKey.value,
      }
    });
  },
}); 