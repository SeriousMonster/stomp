import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerBundleIdTools(server: McpServer) {
  server.tool(
    "list_bundle_ids",
    "List registered bundle IDs in App Store Connect.",
    {
      filter_identifier: z
        .string()
        .optional()
        .describe("Filter by bundle identifier (e.g., com.example.*)"),
      filter_name: z.string().optional().describe("Filter by name"),
      filter_platform: z
        .enum(["IOS", "MAC_OS", "UNIVERSAL"])
        .optional()
        .describe("Filter by platform"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated includes (e.g., bundleIdCapabilities,profiles,app)"
        ),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({
      filter_identifier,
      filter_name,
      filter_platform,
      include,
      limit,
    }) => {
      const params: Record<string, string> = {};
      if (filter_identifier)
        params["filter[identifier]"] = filter_identifier;
      if (filter_name) params["filter[name]"] = filter_name;
      if (filter_platform) params["filter[platform]"] = filter_platform;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        "/v1/bundleIds",
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "register_bundle_id",
    "Register a new bundle ID in App Store Connect.",
    {
      name: z.string().describe("A descriptive name for the bundle ID"),
      identifier: z
        .string()
        .describe("The bundle identifier (e.g., com.example.myapp)"),
      platform: z
        .enum(["IOS", "MAC_OS", "UNIVERSAL"])
        .describe("The platform"),
    },
    async ({ name, identifier, platform }) => {
      const body = {
        data: {
          type: "bundleIds",
          attributes: {
            name,
            identifier,
            platform,
          },
        },
      };

      const response = await apiRequest("POST", "/v1/bundleIds", body);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
