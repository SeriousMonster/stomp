import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { buildParams, jsonResponse } from "../helpers.js";

export function registerReviewTools(server: McpServer) {
  server.tool(
    "list_customer_reviews",
    "List customer reviews for an app. Returns review text, rating, reviewer nickname, and creation date.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      sort: z
        .string()
        .optional()
        .describe(
          "Sort field (e.g., -createdDate, createdDate, rating, -rating)"
        ),
      include: z
        .string()
        .optional()
        .default("customerReviewResponses")
        .describe(
          "Comma-separated related resources to include (default: customerReviewResponses)"
        ),
      limit: z
        .coerce.number()
        .min(1)
        .max(200)
        .optional()
        .describe("Number of reviews to return (max 200)"),
    },
    async ({ app_id, sort, include, limit }) => {
      const params = buildParams({
        "sort": sort,
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/customerReviews`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_customer_review",
    "Get a specific customer review by ID, including any developer responses.",
    {
      id: z.string().describe("The customer review ID"),
      include: z
        .string()
        .optional()
        .default("customerReviewResponses")
        .describe(
          "Comma-separated related resources to include (default: customerReviewResponses)"
        ),
    },
    async ({ id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v1/customerReviews/${id}`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_review_response",
    "Create a developer response to a customer review.",
    {
      review_id: z.string().describe("The customer review ID to respond to"),
      responseBody: z.string().describe("The text of the developer response"),
    },
    async ({ review_id, responseBody }) => {
      const body = {
        data: {
          type: "customerReviewResponses",
          attributes: {
            responseBody,
          },
          relationships: {
            review: {
              data: {
                type: "customerReviews",
                id: review_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/customerReviewResponses",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_review_response",
    "Update an existing developer response to a customer review.",
    {
      id: z.string().describe("The customer review response ID"),
      responseBody: z.string().describe("The updated response text"),
    },
    async ({ id, responseBody }) => {
      const body = {
        data: {
          type: "customerReviewResponses",
          id,
          attributes: {
            responseBody,
          },
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/customerReviewResponses/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_review_response",
    "Delete a developer response to a customer review.",
    {
      id: z.string().describe("The customer review response ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/customerReviewResponses/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted customer review response ${id}`,
      });
    }
  );
}
