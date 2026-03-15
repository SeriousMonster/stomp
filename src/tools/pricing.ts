import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { buildParams, jsonResponse } from "../helpers.js";

export function registerPricingTools(server: McpServer) {
  server.tool(
    "list_app_price_points",
    "List available price points for an app, optionally filtered by territory.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_territory: z
        .string()
        .optional()
        .describe("Filter by territory code (e.g., USA, GBR, JPN)"),
      include: z
        .string()
        .optional()
        .default("territory")
        .describe(
          "Comma-separated related resources to include (default: territory)"
        ),
      limit: z
        .coerce.number()
        .min(1)
        .max(200)
        .optional()
        .describe("Number of price points to return (max 200)"),
    },
    async ({ app_id, filter_territory, include, limit }) => {
      const params = buildParams({
        "filter[territory]": filter_territory,
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appPricePoints`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_app_price_schedule",
    "Get the price schedule for an app, including manual and automatic prices.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      include: z
        .string()
        .optional()
        .default("manualPrices,automaticPrices")
        .describe(
          "Comma-separated related resources to include (default: manualPrices,automaticPrices)"
        ),
    },
    async ({ app_id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appPriceSchedule`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_territories",
    "List all available App Store territories (countries/regions).",
    {
      limit: z
        .coerce.number()
        .min(1)
        .max(200)
        .optional()
        .describe("Number of territories to return (max 200)"),
    },
    async ({ limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        "/v1/territories",
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );
}
