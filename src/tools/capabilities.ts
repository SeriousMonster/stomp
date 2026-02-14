import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerCapabilityTools(server: McpServer) {
  server.tool(
    "list_bundle_id_capabilities",
    "List capabilities enabled for a bundle ID.",
    {
      bundle_id: z.string().describe("The bundle ID resource ID"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ bundle_id, limit }) => {
      const params: Record<string, string> = {};
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        `/v1/bundleIds/${bundle_id}/bundleIdCapabilities`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "enable_bundle_id_capability",
    "Enable a capability for a bundle ID (e.g., push notifications, sign in with Apple).",
    {
      bundle_id: z.string().describe("The bundle ID resource ID"),
      capabilityType: z
        .string()
        .describe(
          "Capability type (e.g., PUSH_NOTIFICATIONS, SIGN_IN_WITH_APPLE, ASSOCIATED_DOMAINS, IN_APP_PURCHASE, GAME_CENTER)"
        ),
    },
    async ({ bundle_id, capabilityType }) => {
      const body = {
        data: {
          type: "bundleIdCapabilities",
          attributes: {
            capabilityType,
          },
          relationships: {
            bundleId: {
              data: {
                type: "bundleIds",
                id: bundle_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/bundleIdCapabilities",
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "disable_bundle_id_capability",
    "Disable (delete) a capability from a bundle ID.",
    {
      capability_id: z.string().describe("The capability ID to disable"),
    },
    async ({ capability_id }) => {
      await apiRequest(
        "DELETE",
        `/v1/bundleIdCapabilities/${capability_id}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: `Capability ${capability_id} disabled`,
            }),
          },
        ],
      };
    }
  );
}
