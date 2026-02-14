import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerUserTools(server: McpServer) {
  server.tool(
    "list_users",
    "List users in your App Store Connect team.",
    {
      filter_roles: z
        .string()
        .optional()
        .describe(
          "Comma-separated roles to filter by (e.g., ADMIN,APP_MANAGER,DEVELOPER)"
        ),
      filter_username: z.string().optional().describe("Filter by username (email)"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., visibleApps)"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ filter_roles, filter_username, include, limit }) => {
      const params: Record<string, string> = {};
      if (filter_roles) params["filter[roles]"] = filter_roles;
      if (filter_username) params["filter[username]"] = filter_username;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest("GET", "/v1/users", undefined, params);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "list_devices",
    "List registered devices.",
    {
      filter_name: z.string().optional().describe("Filter by device name"),
      filter_platform: z
        .enum(["IOS", "MAC_OS"])
        .optional()
        .describe("Filter by platform"),
      filter_status: z
        .enum(["ENABLED", "DISABLED"])
        .optional()
        .describe("Filter by status"),
      filter_udid: z.string().optional().describe("Filter by UDID"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ filter_name, filter_platform, filter_status, filter_udid, limit }) => {
      const params: Record<string, string> = {};
      if (filter_name) params["filter[name]"] = filter_name;
      if (filter_platform) params["filter[platform]"] = filter_platform;
      if (filter_status) params["filter[status]"] = filter_status;
      if (filter_udid) params["filter[udid]"] = filter_udid;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest("GET", "/v1/devices", undefined, params);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
