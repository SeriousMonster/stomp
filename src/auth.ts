import jwt from "jsonwebtoken";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface AuthConfig {
  keyId: string;
  issuerId: string;
  privateKey: string;
}

let cachedConfig: AuthConfig | null = null;

export function getAuthConfig(): AuthConfig {
  if (cachedConfig) return cachedConfig;

  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const p8Path = process.env.APP_STORE_CONNECT_P8_PATH;

  if (!keyId || !issuerId || !p8Path) {
    throw new Error(
      "Missing required environment variables: APP_STORE_CONNECT_KEY_ID, APP_STORE_CONNECT_ISSUER_ID, APP_STORE_CONNECT_P8_PATH"
    );
  }

  // Resolve ~ in path
  const resolvedPath = p8Path.replace(/^~/, process.env.HOME || "");
  const privateKey = readFileSync(resolve(resolvedPath), "utf8");

  cachedConfig = { keyId, issuerId, privateKey };
  return cachedConfig;
}

export function generateToken(): string {
  const { keyId, issuerId, privateKey } = getAuthConfig();

  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: issuerId,
      iat: now,
      exp: now + 20 * 60, // 20 minutes max
      aud: "appstoreconnect-v1",
    },
    privateKey,
    {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: keyId,
        typ: "JWT",
      },
    }
  );
}
