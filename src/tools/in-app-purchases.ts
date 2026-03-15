import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, buildParams, jsonResponse } from "../helpers.js";

export function registerInAppPurchaseTools(server: McpServer) {
  server.tool(
    "list_in_app_purchases",
    "List in-app purchases for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_inAppPurchaseType: z
        .enum(["CONSUMABLE", "NON_CONSUMABLE", "NON_RENEWING_SUBSCRIPTION"])
        .optional()
        .describe("Filter by in-app purchase type"),
      filter_name: z.string().optional().describe("Filter by name"),
      filter_productId: z.string().optional().describe("Filter by product ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., inAppPurchaseLocalizations,pricePoints,content)"
        ),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({
      app_id,
      filter_inAppPurchaseType,
      filter_name,
      filter_productId,
      include,
      limit,
    }) => {
      const params = buildParams({
        "filter[inAppPurchaseType]": filter_inAppPurchaseType,
        "filter[name]": filter_name,
        "filter[productId]": filter_productId,
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/inAppPurchasesV2`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_in_app_purchase",
    "Get details of a specific in-app purchase.",
    {
      id: z.string().describe("The in-app purchase ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., inAppPurchaseLocalizations,pricePoints,content,appStoreReviewScreenshot)"
        ),
    },
    async ({ id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v2/inAppPurchases/${id}`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_in_app_purchase",
    "Create a new in-app purchase for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      name: z.string().describe("The name of the in-app purchase"),
      productId: z
        .string()
        .describe("A unique product ID for the in-app purchase"),
      inAppPurchaseType: z
        .enum(["CONSUMABLE", "NON_CONSUMABLE", "NON_RENEWING_SUBSCRIPTION"])
        .describe("The type of in-app purchase"),
    },
    async ({ app_id, name, productId, inAppPurchaseType }) => {
      const body = {
        data: {
          type: "inAppPurchases",
          attributes: {
            name,
            productId,
            inAppPurchaseType,
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

      const response = await apiRequest("POST", "/v2/inAppPurchases", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_in_app_purchase",
    "Update an existing in-app purchase.",
    {
      id: z.string().describe("The in-app purchase ID"),
      name: z.string().optional().describe("Updated name"),
      reviewNote: z.string().optional().describe("Review note for App Review"),
      familySharable: booleanParam
        .optional()
        .describe("Whether the purchase is family sharable"),
    },
    async ({ id, name, reviewNote, familySharable }) => {
      const attributes: Record<string, unknown> = {};
      if (name !== undefined) attributes.name = name;
      if (reviewNote !== undefined) attributes.reviewNote = reviewNote;
      if (familySharable !== undefined)
        attributes.familySharable = familySharable;

      const body = {
        data: {
          type: "inAppPurchases",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v2/inAppPurchases/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_in_app_purchase",
    "Delete an in-app purchase.",
    {
      id: z.string().describe("The in-app purchase ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v2/inAppPurchases/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted in-app purchase ${id}`,
      });
    }
  );

  server.tool(
    "list_iap_localizations",
    "List localizations for an in-app purchase.",
    {
      iap_id: z.string().describe("The in-app purchase ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ iap_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v2/inAppPurchases/${iap_id}/inAppPurchaseLocalizations`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_iap_localization",
    "Create a localization for an in-app purchase.",
    {
      iap_id: z.string().describe("The in-app purchase ID"),
      locale: z.string().describe("The locale code (e.g., en-US, fr-FR)"),
      name: z.string().describe("Localized name of the in-app purchase"),
      description: z
        .string()
        .optional()
        .describe("Localized description of the in-app purchase"),
    },
    async ({ iap_id, locale, name, description }) => {
      const attributes: Record<string, unknown> = { locale, name };
      if (description !== undefined) attributes.description = description;

      const body = {
        data: {
          type: "inAppPurchaseLocalizations",
          attributes,
          relationships: {
            inAppPurchase: {
              data: {
                type: "inAppPurchases",
                id: iap_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/inAppPurchaseLocalizations",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_iap_localization",
    "Update a localization for an in-app purchase.",
    {
      id: z.string().describe("The in-app purchase localization ID"),
      name: z.string().optional().describe("Updated localized name"),
      description: z
        .string()
        .optional()
        .describe("Updated localized description"),
    },
    async ({ id, name, description }) => {
      const attributes: Record<string, unknown> = {};
      if (name !== undefined) attributes.name = name;
      if (description !== undefined) attributes.description = description;

      const body = {
        data: {
          type: "inAppPurchaseLocalizations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/inAppPurchaseLocalizations/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_iap_localization",
    "Delete a localization for an in-app purchase.",
    {
      id: z
        .string()
        .describe("The in-app purchase localization ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/inAppPurchaseLocalizations/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted in-app purchase localization ${id}`,
      });
    }
  );

  server.tool(
    "list_iap_price_points",
    "List price points for an in-app purchase, optionally filtered by territory.",
    {
      iap_id: z.string().describe("The in-app purchase ID"),
      filter_territory: z
        .string()
        .optional()
        .describe("Filter by territory code (e.g., USA, GBR)"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ iap_id, filter_territory, limit }) => {
      const params = buildParams({
        "filter[territory]": filter_territory,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v2/inAppPurchases/${iap_id}/pricePoints`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "submit_iap_for_review",
    "Submit an in-app purchase for App Review.",
    {
      iap_id: z
        .string()
        .describe("The in-app purchase ID to submit for review"),
    },
    async ({ iap_id }) => {
      const body = {
        data: {
          type: "inAppPurchaseSubmissions",
          relationships: {
            inAppPurchase: {
              data: {
                type: "inAppPurchases",
                id: iap_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/inAppPurchaseSubmissions",
        body
      );

      return jsonResponse(response);
    }
  );
}
