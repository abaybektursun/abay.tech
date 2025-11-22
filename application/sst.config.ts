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

    const table = new sst.aws.Dynamo("chats", {
      fields: {
        userId: "string",
        id: "string",
      },
      primaryIndex: {
        hashKey: "userId",
        rangeKey: "id",
      },
    });

    new sst.aws.Nextjs("abay", {
      link: [groqApiKey, openaiApiKey, table],
      // Set the domain only for the production stage
      domain: $app.stage === "production" ? "abay.tech" : undefined,
      environment: {
        GROQ_API_KEY: groqApiKey.value,
        OPENAI_API_KEY: openaiApiKey.value,
        DYNAMODB_TABLE: table.name,
      }
    });
  },
}); 