import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerGenericTools(server: McpServer) {
  server.tool(
    "api_request",
    `Make an arbitrary request to the App Store Connect API. Use this for any endpoint not covered by a dedicated tool.
Base URL is https://api.appstoreconnect.apple.com — just provide the path (e.g., /v1/apps, /v2/inAppPurchases).
Auth is handled automatically. See https://developer.apple.com/documentation/appstoreconnectapi for full API docs.`,
    {
      method: z
        .enum(["GET", "POST", "PATCH", "DELETE"])
        .describe("HTTP method"),
      path: z
        .string()
        .describe(
          "API path (e.g., /v1/apps, /v1/apps/{id}/appStoreVersions, /v2/inAppPurchases)"
        ),
      params: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          'Query parameters as key-value pairs (e.g., {"filter[bundleId]": "com.example.app", "include": "appStoreVersions", "limit": "10"})'
        ),
      body: z
        .string()
        .optional()
        .describe(
          "Request body as a JSON string for POST/PATCH requests. Must follow the JSON:API format used by App Store Connect."
        ),
    },
    async ({ method, path, params, body }) => {
      const parsedBody = body ? JSON.parse(body) : undefined;
      const response = await apiRequest(method, path, parsedBody, params);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
