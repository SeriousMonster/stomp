import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerSubmissionTools(server: McpServer) {
  server.tool(
    "create_app_store_version_submission",
    "Submit an App Store version for review.",
    {
      version_id: z.string().describe("The App Store version ID to submit"),
    },
    async ({ version_id }) => {
      const body = {
        data: {
          type: "appStoreVersionSubmissions",
          relationships: {
            appStoreVersion: {
              data: {
                type: "appStoreVersions",
                id: version_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/appStoreVersionSubmissions",
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
