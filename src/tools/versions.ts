import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { buildParams, jsonResponse } from "../helpers.js";

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
        .enum(["ACCEPTED", "DEVELOPER_REJECTED", "DEVELOPER_REMOVED_FROM_SALE", "IN_REVIEW", "INVALID_BINARY", "METADATA_REJECTED", "PENDING_APPLE_RELEASE", "PENDING_DEVELOPER_RELEASE", "PREPARE_FOR_SUBMISSION", "PROCESSING_FOR_APP_STORE", "READY_FOR_REVIEW", "READY_FOR_SALE", "REJECTED", "REMOVED_FROM_SALE", "REPLACED_WITH_NEW_VERSION", "WAITING_FOR_EXPORT_COMPLIANCE", "WAITING_FOR_REVIEW"])
        .optional()
        .describe("Filter by App Store version state"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated includes (e.g., appStoreVersionLocalizations,build,appStoreVersionSubmission)"
        ),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({
      app_id,
      filter_versionString,
      filter_platform,
      filter_appStoreState,
      include,
      limit,
    }) => {
      const params = buildParams({
        "filter[versionString]": filter_versionString,
        "filter[platform]": filter_platform,
        "filter[appStoreState]": filter_appStoreState,
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appStoreVersions`,
        undefined,
        params
      );

      return jsonResponse(response);
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

      return jsonResponse(response);
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

      return jsonResponse(response);
    }
  );
}
