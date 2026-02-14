import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// We need to reset the cached config between tests, so we re-import fresh each time
// by using dynamic imports with vi.resetModules().

// Generate a real EC P-256 key pair for testing
const { privateKey: testPrivateKeyObject } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});
const testP8Key = testPrivateKeyObject.export({
  type: "pkcs8",
  format: "pem",
}) as string;

const TEST_P8_PATH = join(tmpdir(), "test-auth-key.p8");

describe("auth", () => {
  beforeEach(() => {
    // Write the test key to a temp file
    writeFileSync(TEST_P8_PATH, testP8Key);

    // Clear any cached config by resetting modules
    vi.resetModules();

    // Clear env vars before each test
    delete process.env.APP_STORE_CONNECT_KEY_ID;
    delete process.env.APP_STORE_CONNECT_ISSUER_ID;
    delete process.env.APP_STORE_CONNECT_P8_PATH;
  });

  afterEach(() => {
    try {
      unlinkSync(TEST_P8_PATH);
    } catch {
      // file may not exist, that's fine
    }
  });

  describe("getAuthConfig", () => {
    it("throws when env vars are missing", async () => {
      const { getAuthConfig } = await import("../src/auth.js");
      expect(() => getAuthConfig()).toThrow(
        "Missing required environment variables"
      );
    });

    it("throws when only some env vars are set", async () => {
      process.env.APP_STORE_CONNECT_KEY_ID = "ABC123";
      // Missing ISSUER_ID and P8_PATH
      const { getAuthConfig } = await import("../src/auth.js");
      expect(() => getAuthConfig()).toThrow(
        "Missing required environment variables"
      );
    });

    it("reads env vars and p8 file correctly", async () => {
      process.env.APP_STORE_CONNECT_KEY_ID = "TESTKEY123";
      process.env.APP_STORE_CONNECT_ISSUER_ID = "test-issuer-id";
      process.env.APP_STORE_CONNECT_P8_PATH = TEST_P8_PATH;

      const { getAuthConfig } = await import("../src/auth.js");
      const config = getAuthConfig();

      expect(config.keyId).toBe("TESTKEY123");
      expect(config.issuerId).toBe("test-issuer-id");
      expect(config.privateKey).toBe(testP8Key);
    });

    it("caches config on subsequent calls", async () => {
      process.env.APP_STORE_CONNECT_KEY_ID = "TESTKEY123";
      process.env.APP_STORE_CONNECT_ISSUER_ID = "test-issuer-id";
      process.env.APP_STORE_CONNECT_P8_PATH = TEST_P8_PATH;

      const { getAuthConfig } = await import("../src/auth.js");
      const config1 = getAuthConfig();
      const config2 = getAuthConfig();

      expect(config1).toBe(config2); // same reference
    });
  });

  describe("generateToken", () => {
    it("produces a valid JWT with correct claims and headers", async () => {
      process.env.APP_STORE_CONNECT_KEY_ID = "TESTKEY123";
      process.env.APP_STORE_CONNECT_ISSUER_ID = "test-issuer-id";
      process.env.APP_STORE_CONNECT_P8_PATH = TEST_P8_PATH;

      const { generateToken } = await import("../src/auth.js");
      const token = generateToken();

      // Decode without verification to inspect structure
      const decoded = jwt.decode(token, { complete: true });
      expect(decoded).not.toBeNull();

      // Check header
      expect(decoded!.header.alg).toBe("ES256");
      expect(decoded!.header.kid).toBe("TESTKEY123");
      expect(decoded!.header.typ).toBe("JWT");

      // Check payload claims
      const payload = decoded!.payload as jwt.JwtPayload;
      expect(payload.iss).toBe("test-issuer-id");
      expect(payload.aud).toBe("appstoreconnect-v1");
      expect(payload.iat).toBeTypeOf("number");
      expect(payload.exp).toBeTypeOf("number");

      // exp should be iat + 20 minutes (1200 seconds)
      expect(payload.exp! - payload.iat!).toBe(20 * 60);
    });

    it("produces a token that can be verified with the public key", async () => {
      process.env.APP_STORE_CONNECT_KEY_ID = "TESTKEY123";
      process.env.APP_STORE_CONNECT_ISSUER_ID = "test-issuer-id";
      process.env.APP_STORE_CONNECT_P8_PATH = TEST_P8_PATH;

      const { generateToken } = await import("../src/auth.js");
      const token = generateToken();

      // Derive the public key from the private key
      const privateKeyObj = createPrivateKey(testP8Key);
      const publicKeyObj = createPublicKey(privateKeyObj);
      const publicKey = publicKeyObj.export({ type: "spki", format: "pem" });

      // Verify the token with the public key
      const verified = jwt.verify(token, publicKey as string, {
        algorithms: ["ES256"],
      }) as jwt.JwtPayload;

      expect(verified.iss).toBe("test-issuer-id");
      expect(verified.aud).toBe("appstoreconnect-v1");
    });
  });
});
