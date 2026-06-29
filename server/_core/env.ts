/**
 * Server environment configuration.
 * All secrets are loaded from process.env — never hard-coded.
 *
 * Required:
 *   DATABASE_URL        MySQL connection string (mysql2 driver format)
 *   JWT_SECRET          >=32-char secret for signing session cookies — MUST be set
 *   VITE_APP_ID         OAuth application / client ID
 *   OAUTH_SERVER_URL    Base URL of the OIDC provider (default: configured OIDC provider)
 *
 * Optional (LLM / image generation / storage):
 *   LLM_API_BASE_URL    Base URL for an OpenAI-compatible chat completions endpoint
 *   LLM_API_KEY         API key for the LLM provider (OpenAI, Gemini via proxy, etc.)
 *
 * Optional (data / media proxy):
 *   DATA_PROXY_URL      Base URL for server-side data/media proxy (dataApi, voiceTranscription)
 *   DATA_PROXY_KEY      API key for the above proxy
 *
 * Optional (platform):
 *   OWNER_OPEN_ID       Auth openId of the platform owner (auto-assigned admin role)
 *
 * See .env.example for a full annotated list.
 */

const jwtSecret = process.env.JWT_SECRET ?? "";
if (process.env.NODE_ENV !== "test" && jwtSecret.length < 32) {
  throw new Error(
    "[env] JWT_SECRET is missing or shorter than 32 characters. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" " +
      "and set it in your .env file before starting the server."
  );
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: jwtSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM provider — any OpenAI-compatible endpoint
  llmApiBaseUrl: process.env.LLM_API_BASE_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  // Data / media proxy (server/_core/dataApi.ts, voiceTranscription.ts)
  dataProxyUrl: process.env.DATA_PROXY_URL ?? "",
  dataProxyKey: process.env.DATA_PROXY_KEY ?? "",
};
