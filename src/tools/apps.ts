import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest, apiRequestAllPages } from "../client.js";

export function registerAppTools(server: McpServer) {
  server.tool(
    "list_apps",
    "List all apps in App Store Connect. Returns app ID, name, bundle ID, SKU, and platform.",
    {
      limit: z
        .number()
        .min(1)
        .max(200)
        .optional()
        .describe("Number of apps to return (max 200)"),
      filter_bundleId: z
        .string()
        .optional()
        .describe("Filter by bundle ID (e.g., com.example.app)"),
      filter_name: z.string().optional().describe("Filter by app name"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., appStoreVersions,builds,betaGroups)"
        ),
    },
    async ({ limit, filter_bundleId, filter_name, include }) => {
      const params: Record<string, string> = {};
      if (limit) params["limit"] = String(limit);
      if (filter_bundleId) params["filter[bundleId]"] = filter_bundleId;
      if (filter_name) params["filter[name]"] = filter_name;
      if (include) params["include"] = include;

      const response = await apiRequest("GET", "/v1/apps", undefined, params);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "get_app",
    "Get detailed info for a specific app by its App Store Connect ID. Supports includes for related resources.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., appStoreVersions,builds,betaGroups,appInfos)"
        ),
      fields_apps: z
        .string()
        .optional()
        .describe(
          "Comma-separated fields to return for apps (e.g., name,bundleId,sku,primaryLocale)"
        ),
    },
    async ({ app_id, include, fields_apps }) => {
      const params: Record<string, string> = {};
      if (include) params["include"] = include;
      if (fields_apps) params["fields[apps]"] = fields_apps;

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "create_app",
    "Create a new app in App Store Connect.",
    {
      name: z.string().describe("The name of the app"),
      bundleId: z.string().describe("The bundle ID (must match a registered bundle ID)"),
      sku: z.string().describe("A unique SKU for the app"),
      primaryLocale: z
        .string()
        .optional()
        .default("en-US")
        .describe("Primary locale (default: en-US)"),
      bundleId_resource_id: z
        .string()
        .describe("The App Store Connect ID of the registered bundle ID resource"),
    },
    async ({ name, bundleId: _bundleId, sku, primaryLocale, bundleId_resource_id }) => {
      const body = {
        data: {
          type: "apps",
          attributes: {
            name,
            sku,
            primaryLocale,
            bundleId: _bundleId,
          },
          relationships: {
            bundleId: {
              data: {
                type: "bundleIds",
                id: bundleId_resource_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/apps", body);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
