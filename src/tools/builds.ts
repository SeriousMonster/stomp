import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerBuildTools(server: McpServer) {
  server.tool(
    "list_builds",
    "List builds for an app. Returns build number, version, processing state, and upload date.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_version: z
        .string()
        .optional()
        .describe("Filter by version string"),
      filter_processingState: z
        .enum(["PROCESSING", "FAILED", "INVALID", "VALID"])
        .optional()
        .describe("Filter by processing state"),
      filter_expired: z
        .boolean()
        .optional()
        .describe("Filter by expired status"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated includes (e.g., app,betaAppReviewSubmission,buildBetaDetail,preReleaseVersion)"
        ),
      sort: z
        .string()
        .optional()
        .describe(
          "Sort field (e.g., -uploadedDate for newest first, uploadedDate for oldest first)"
        ),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({
      app_id,
      filter_version,
      filter_processingState,
      filter_expired,
      include,
      sort,
      limit,
    }) => {
      const params: Record<string, string> = {
        "filter[app]": app_id,
      };
      if (filter_version) params["filter[version]"] = filter_version;
      if (filter_processingState)
        params["filter[processingState]"] = filter_processingState;
      if (filter_expired !== undefined)
        params["filter[expired]"] = String(filter_expired);
      if (include) params["include"] = include;
      if (sort) params["sort"] = sort;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        "/v1/builds",
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "add_build_to_beta_group",
    "Add a build to a beta group for TestFlight distribution.",
    {
      beta_group_id: z.string().describe("The beta group ID"),
      build_ids: z.array(z.string()).describe("Array of build IDs to add"),
    },
    async ({ beta_group_id, build_ids }) => {
      const body = {
        data: build_ids.map((id) => ({
          type: "builds",
          id,
        })),
      };

      await apiRequest(
        "POST",
        `/v1/betaGroups/${beta_group_id}/relationships/builds`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: `Added ${build_ids.length} build(s) to beta group ${beta_group_id}`,
            }),
          },
        ],
      };
    }
  );
}
