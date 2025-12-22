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
    const elevenlabsApiKey = new sst.Secret("ELEVENLABS_API_KEY");
    const authSecret = new sst.Secret("AUTH_SECRET");
    const authGithubId = new sst.Secret("AUTH_GITHUB_ID");
    const authGithubSecret = new sst.Secret("AUTH_GITHUB_SECRET");
    const authGoogleId = new sst.Secret("AUTH_GOOGLE_ID");
    const authGoogleSecret = new sst.Secret("AUTH_GOOGLE_SECRET");

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

    const artifactsTable = new sst.aws.Dynamo("artifacts", {
      fields: {
        userId: "string",
        id: "string",
      },
      primaryIndex: {
        hashKey: "userId",
        rangeKey: "id",
      },
    });

    const sharesTable = new sst.aws.Dynamo("shares", {
      fields: {
        chatId: "string",
      },
      primaryIndex: {
        hashKey: "chatId",
      },
    });

    new sst.aws.Nextjs("abay", {
      link: [groqApiKey, openaiApiKey, elevenlabsApiKey, table, artifactsTable, sharesTable],
      // Set the domain only for the production stage
      domain: $app.stage === "production" ? "abay.tech" : undefined,
      environment: {
        GROQ_API_KEY: groqApiKey.value,
        OPENAI_API_KEY: openaiApiKey.value,
        ELEVENLABS_API_KEY: elevenlabsApiKey.value,
        DYNAMODB_TABLE: table.name,
        ARTIFACTS_TABLE: artifactsTable.name,
        SHARES_TABLE: sharesTable.name,
        AUTH_SECRET: authSecret.value,
        AUTH_GITHUB_ID: authGithubId.value,
        AUTH_GITHUB_SECRET: authGithubSecret.value,
        AUTH_GOOGLE_ID: authGoogleId.value,
        AUTH_GOOGLE_SECRET: authGoogleSecret.value,
        AUTH_TRUST_HOST: "true",
      }
    });
  },
}); 