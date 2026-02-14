import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerVersionTools(server: McpServer) {
  server.tool(
    "list_app_store_versions",
    "List all App Store versions for an app. Includes version string, state, and platform.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_versionString: z
        .string()
        .optional()
        .describe("Filter by version string (e.g., 1.0.0)"),
      filter_platform: z
        .enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"])
        .optional()
        .describe("Filter by platform"),
      filter_appStoreState: z
        .string()
        .optional()
        .describe(
          "Filter by state (e.g., READY_FOR_SALE, PREPARE_FOR_SUBMISSION, WAITING_FOR_REVIEW)"
        ),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated includes (e.g., appStoreVersionLocalizations,build,appStoreVersionSubmission)"
        ),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({
      app_id,
      filter_versionString,
      filter_platform,
      filter_appStoreState,
      include,
      limit,
    }) => {
      const params: Record<string, string> = {};
      if (filter_versionString)
        params["filter[versionString]"] = filter_versionString;
      if (filter_platform) params["filter[platform]"] = filter_platform;
      if (filter_appStoreState)
        params["filter[appStoreState]"] = filter_appStoreState;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appStoreVersions`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "create_app_store_version",
    "Create a new App Store version for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      versionString: z.string().describe("The version string (e.g., 1.2.0)"),
      platform: z
        .enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"])
        .describe("The platform"),
      releaseType: z
        .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
        .optional()
        .default("AFTER_APPROVAL")
        .describe("Release type (default: AFTER_APPROVAL)"),
      copyright: z.string().optional().describe("Copyright text"),
      earliestReleaseDate: z
        .string()
        .optional()
        .describe("Earliest release date (ISO 8601) — only for SCHEDULED release type"),
    },
    async ({
      app_id,
      versionString,
      platform,
      releaseType,
      copyright,
      earliestReleaseDate,
    }) => {
      const attributes: Record<string, unknown> = {
        versionString,
        platform,
        releaseType,
      };
      if (copyright) attributes.copyright = copyright;
      if (earliestReleaseDate)
        attributes.earliestReleaseDate = earliestReleaseDate;

      const body = {
        data: {
          type: "appStoreVersions",
          attributes,
          relationships: {
            app: {
              data: {
                type: "apps",
                id: app_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/appStoreVersions", body);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "update_app_store_version",
    "Update an existing App Store version (e.g., change version string, copyright, release type).",
    {
      version_id: z.string().describe("The App Store version ID"),
      versionString: z.string().optional().describe("New version string"),
      copyright: z.string().optional().describe("Copyright text"),
      releaseType: z
        .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
        .optional()
        .describe("Release type"),
      earliestReleaseDate: z
        .string()
        .optional()
        .describe("Earliest release date (ISO 8601)"),
    },
    async ({
      version_id,
      versionString,
      copyright,
      releaseType,
      earliestReleaseDate,
    }) => {
      const attributes: Record<string, unknown> = {};
      if (versionString !== undefined) attributes.versionString = versionString;
      if (copyright !== undefined) attributes.copyright = copyright;
      if (releaseType !== undefined) attributes.releaseType = releaseType;
      if (earliestReleaseDate !== undefined)
        attributes.earliestReleaseDate = earliestReleaseDate;

      const body = {
        data: {
          type: "appStoreVersions",
          id: version_id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/appStoreVersions/${version_id}`,
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
