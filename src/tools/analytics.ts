import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { buildParams, jsonResponse } from "../helpers.js";

export function registerAnalyticsTools(server: McpServer) {
  server.tool(
    "create_analytics_report_request",
    "Create a new analytics report request for an app. Use ONE_TIME_SNAPSHOT for a single report or ONGOING for continuous reporting.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      accessType: z
        .enum(["ONE_TIME_SNAPSHOT", "ONGOING"])
        .describe("The access type for the report request"),
    },
    async ({ app_id, accessType }) => {
      const body = {
        data: {
          type: "analyticsReportRequests",
          attributes: {
            accessType,
          },
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

      const response = await apiRequest(
        "POST",
        "/v1/analyticsReportRequests",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_analytics_report_requests",
    "List analytics report requests for an app, optionally filtered by access type.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_accessType: z
        .enum(["ONE_TIME_SNAPSHOT", "ONGOING"])
        .optional()
        .describe("Filter by access type"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ app_id, filter_accessType, limit }) => {
      const params = buildParams({
        "filter[accessType]": filter_accessType,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/analyticsReportRequests`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_analytics_report_request",
    "Get a specific analytics report request by ID, optionally including its reports.",
    {
      id: z.string().describe("The analytics report request ID"),
      include: z
        .string()
        .optional()
        .default("reports")
        .describe(
          "Comma-separated related resources to include (default: reports)"
        ),
    },
    async ({ id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v1/analyticsReportRequests/${id}`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_analytics_reports",
    "List analytics reports for a report request, optionally filtered by category.",
    {
      request_id: z.string().describe("The analytics report request ID"),
      filter_category: z
        .enum(["APP_USAGE", "APP_STORE_ENGAGEMENT", "COMMERCE", "FRAMEWORK_USAGE", "PERFORMANCE"])
        .optional()
        .describe("Filter by report category"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ request_id, filter_category, limit }) => {
      const params = buildParams({
        "filter[category]": filter_category,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/analyticsReportRequests/${request_id}/reports`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_analytics_report_instances",
    "List instances of an analytics report, optionally filtered by processing date and granularity.",
    {
      report_id: z.string().describe("The analytics report ID"),
      filter_processingDate: z
        .string()
        .optional()
        .describe("Filter by processing date (ISO 8601 date string)"),
      filter_granularity: z
        .enum(["DAILY", "WEEKLY", "MONTHLY"])
        .optional()
        .describe("Filter by granularity"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ report_id, filter_processingDate, filter_granularity, limit }) => {
      const params = buildParams({
        "filter[processingDate]": filter_processingDate,
        "filter[granularity]": filter_granularity,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/analyticsReports/${report_id}/instances`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_analytics_report_segments",
    "List segments for an analytics report instance.",
    {
      instance_id: z.string().describe("The analytics report instance ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ instance_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/analyticsReportInstances/${instance_id}/segments`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );
}
