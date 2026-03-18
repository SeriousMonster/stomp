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
  if (p8Path.startsWith("~") && !process.env.HOME) {
    throw new Error(
      "HOME environment variable is not set — cannot resolve ~ in APP_STORE_CONNECT_P8_PATH"
    );
  }
  const resolvedPath = p8Path.replace(/^~/, process.env.HOME || "");

  let privateKey: string;
  try {
    privateKey = readFileSync(resolve(resolvedPath), "utf8");
  } catch {
    throw new Error(
      "Failed to read .p8 private key file. Check that APP_STORE_CONNECT_P8_PATH points to a valid file."
    );
  }

  cachedConfig = { keyId, issuerId, privateKey };
  return cachedConfig;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function generateToken(): string {
  const now = Math.floor(Date.now() / 1000);

  // Reuse cached token if it has at least 5 minutes left
  if (cachedToken && cachedToken.expiresAt - now > 5 * 60) {
    return cachedToken.token;
  }

  const { keyId, issuerId, privateKey } = getAuthConfig();
  const exp = now + 20 * 60; // 20 minutes max

  const token = jwt.sign(
    {
      iss: issuerId,
      iat: now,
      exp,
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

  cachedToken = { token, expiresAt: exp };
  return token;
}
