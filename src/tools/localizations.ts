import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerLocalizationTools(server: McpServer) {
  server.tool(
    "list_version_localizations",
    "List all localizations for an App Store version. Returns description, keywords, whatsNew, promotional text, etc. for each locale.",
    {
      version_id: z.string().describe("The App Store version ID"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ version_id, limit }) => {
      const params: Record<string, string> = {};
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        `/v1/appStoreVersions/${version_id}/appStoreVersionLocalizations`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "get_version_localization",
    "Get a specific version localization by ID. Returns all localization fields.",
    {
      localization_id: z.string().describe("The localization ID"),
    },
    async ({ localization_id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/appStoreVersionLocalizations/${localization_id}`
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "create_version_localization",
    "Create a new localization for an App Store version. Use this to add a new locale (e.g., fr-FR, de-DE).",
    {
      version_id: z.string().describe("The App Store version ID"),
      locale: z.string().describe("Locale code (e.g., en-US, fr-FR, de-DE, ja)"),
      description: z.string().optional().describe("App description for this locale"),
      keywords: z
        .string()
        .optional()
        .describe("Comma-separated keywords (max 100 chars)"),
      whatsNew: z
        .string()
        .optional()
        .describe("What's new in this version (release notes)"),
      promotionalText: z
        .string()
        .optional()
        .describe("Promotional text (can be updated without a new version)"),
      marketingUrl: z.string().optional().describe("Marketing URL"),
      supportUrl: z.string().optional().describe("Support URL"),
    },
    async ({
      version_id,
      locale,
      description,
      keywords,
      whatsNew,
      promotionalText,
      marketingUrl,
      supportUrl,
    }) => {
      const attributes: Record<string, unknown> = { locale };
      if (description !== undefined) attributes.description = description;
      if (keywords !== undefined) attributes.keywords = keywords;
      if (whatsNew !== undefined) attributes.whatsNew = whatsNew;
      if (promotionalText !== undefined)
        attributes.promotionalText = promotionalText;
      if (marketingUrl !== undefined) attributes.marketingUrl = marketingUrl;
      if (supportUrl !== undefined) attributes.supportUrl = supportUrl;

      const body = {
        data: {
          type: "appStoreVersionLocalizations",
          attributes,
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
        "/v1/appStoreVersionLocalizations",
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "update_version_localization",
    "Update an existing version localization. Use this to set or change description, keywords, whatsNew, promotional text, URLs.",
    {
      localization_id: z.string().describe("The localization ID"),
      description: z.string().optional().describe("App description"),
      keywords: z
        .string()
        .optional()
        .describe("Comma-separated keywords (max 100 chars)"),
      whatsNew: z.string().optional().describe("What's new text (release notes)"),
      promotionalText: z.string().optional().describe("Promotional text"),
      marketingUrl: z.string().optional().describe("Marketing URL"),
      supportUrl: z.string().optional().describe("Support URL"),
    },
    async ({
      localization_id,
      description,
      keywords,
      whatsNew,
      promotionalText,
      marketingUrl,
      supportUrl,
    }) => {
      const attributes: Record<string, unknown> = {};
      if (description !== undefined) attributes.description = description;
      if (keywords !== undefined) attributes.keywords = keywords;
      if (whatsNew !== undefined) attributes.whatsNew = whatsNew;
      if (promotionalText !== undefined)
        attributes.promotionalText = promotionalText;
      if (marketingUrl !== undefined) attributes.marketingUrl = marketingUrl;
      if (supportUrl !== undefined) attributes.supportUrl = supportUrl;

      const body = {
        data: {
          type: "appStoreVersionLocalizations",
          id: localization_id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/appStoreVersionLocalizations/${localization_id}`,
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
