import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, buildParams, jsonResponse } from "../helpers.js";

export function registerSubscriptionTools(server: McpServer) {
  server.tool(
    "list_subscription_groups",
    "List subscription groups for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., subscriptions,subscriptionGroupLocalizations)"
        ),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ app_id, include, limit }) => {
      const params = buildParams({
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/subscriptionGroups`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_subscription_group",
    "Create a new subscription group for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      referenceName: z
        .string()
        .describe("A reference name for the subscription group"),
    },
    async ({ app_id, referenceName }) => {
      const body = {
        data: {
          type: "subscriptionGroups",
          attributes: {
            referenceName,
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
        "/v1/subscriptionGroups",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_subscription_group",
    "Get details of a specific subscription group.",
    {
      id: z.string().describe("The subscription group ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., subscriptions,subscriptionGroupLocalizations)"
        ),
    },
    async ({ id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v1/subscriptionGroups/${id}`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_subscriptions",
    "List subscriptions within a subscription group.",
    {
      group_id: z.string().describe("The subscription group ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., subscriptionLocalizations,subscriptionAvailability)"
        ),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ group_id, include, limit }) => {
      const params = buildParams({
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/subscriptionGroups/${group_id}/subscriptions`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_subscription",
    "Create a new subscription within a subscription group.",
    {
      group_id: z.string().describe("The subscription group ID"),
      name: z.string().describe("The name of the subscription"),
      productId: z.string().describe("A unique product ID for the subscription"),
      familySharable: booleanParam
        .optional()
        .describe("Whether the subscription is family sharable"),
      subscriptionPeriod: z
        .enum([
          "ONE_WEEK",
          "ONE_MONTH",
          "TWO_MONTHS",
          "THREE_MONTHS",
          "SIX_MONTHS",
          "ONE_YEAR",
        ])
        .describe("The subscription renewal period"),
      reviewNote: z
        .string()
        .optional()
        .describe("Review note for App Review"),
      groupLevel: z
        .coerce.number()
        .optional()
        .describe(
          "The level of the subscription within the group (1 is highest)"
        ),
    },
    async ({
      group_id,
      name,
      productId,
      familySharable,
      subscriptionPeriod,
      reviewNote,
      groupLevel,
    }) => {
      const attributes: Record<string, unknown> = {
        name,
        productId,
        subscriptionPeriod,
      };
      if (familySharable !== undefined)
        attributes.familySharable = familySharable;
      if (reviewNote !== undefined) attributes.reviewNote = reviewNote;
      if (groupLevel !== undefined) attributes.groupLevel = groupLevel;

      const body = {
        data: {
          type: "subscriptions",
          attributes,
          relationships: {
            group: {
              data: {
                type: "subscriptionGroups",
                id: group_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/subscriptions", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_subscription",
    "Update an existing subscription.",
    {
      id: z.string().describe("The subscription ID"),
      name: z.string().optional().describe("Updated name"),
      familySharable: booleanParam
        .optional()
        .describe("Whether the subscription is family sharable"),
      subscriptionPeriod: z
        .enum([
          "ONE_WEEK",
          "ONE_MONTH",
          "TWO_MONTHS",
          "THREE_MONTHS",
          "SIX_MONTHS",
          "ONE_YEAR",
        ])
        .optional()
        .describe("Updated subscription renewal period"),
      reviewNote: z
        .string()
        .optional()
        .describe("Updated review note for App Review"),
      groupLevel: z
        .coerce.number()
        .optional()
        .describe("Updated level within the subscription group"),
    },
    async ({ id, name, familySharable, subscriptionPeriod, reviewNote, groupLevel }) => {
      const attributes: Record<string, unknown> = {};
      if (name !== undefined) attributes.name = name;
      if (familySharable !== undefined)
        attributes.familySharable = familySharable;
      if (subscriptionPeriod !== undefined)
        attributes.subscriptionPeriod = subscriptionPeriod;
      if (reviewNote !== undefined) attributes.reviewNote = reviewNote;
      if (groupLevel !== undefined) attributes.groupLevel = groupLevel;

      const body = {
        data: {
          type: "subscriptions",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/subscriptions/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_subscription",
    "Delete a subscription.",
    {
      id: z.string().describe("The subscription ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/subscriptions/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted subscription ${id}`,
      });
    }
  );

  server.tool(
    "list_subscription_localizations",
    "List localizations for a subscription.",
    {
      sub_id: z.string().describe("The subscription ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ sub_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/subscriptions/${sub_id}/subscriptionLocalizations`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_subscription_localization",
    "Create a localization for a subscription.",
    {
      sub_id: z.string().describe("The subscription ID"),
      locale: z.string().describe("The locale code (e.g., en-US, fr-FR)"),
      name: z.string().describe("Localized name of the subscription"),
      description: z
        .string()
        .optional()
        .describe("Localized description of the subscription"),
    },
    async ({ sub_id, locale, name, description }) => {
      const attributes: Record<string, unknown> = { locale, name };
      if (description !== undefined) attributes.description = description;

      const body = {
        data: {
          type: "subscriptionLocalizations",
          attributes,
          relationships: {
            subscription: {
              data: {
                type: "subscriptions",
                id: sub_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/subscriptionLocalizations",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_subscription_localization",
    "Update a localization for a subscription.",
    {
      id: z.string().describe("The subscription localization ID"),
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
          type: "subscriptionLocalizations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/subscriptionLocalizations/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_subscription_localization",
    "Delete a localization for a subscription.",
    {
      id: z
        .string()
        .describe("The subscription localization ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/subscriptionLocalizations/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted subscription localization ${id}`,
      });
    }
  );

  server.tool(
    "list_subscription_prices",
    "List prices for a subscription, including territory info.",
    {
      sub_id: z.string().describe("The subscription ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated related resources to include (e.g., territory)"
        ),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ sub_id, include, limit }) => {
      const params = buildParams({
        "include": include,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/subscriptions/${sub_id}/prices`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_subscription_price_points",
    "List price points for a subscription, optionally filtered by territory.",
    {
      sub_id: z.string().describe("The subscription ID"),
      filter_territory: z
        .string()
        .optional()
        .describe("Filter by territory code (e.g., USA, GBR)"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ sub_id, filter_territory, limit }) => {
      const params = buildParams({
        "filter[territory]": filter_territory,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/subscriptions/${sub_id}/pricePoints`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_subscription_introductory_offer",
    "Create an introductory offer for a subscription.",
    {
      sub_id: z.string().describe("The subscription ID"),
      territory_id: z
        .string()
        .describe("The territory ID for this offer"),
      startDate: z
        .string()
        .optional()
        .describe("Start date for the offer (YYYY-MM-DD)"),
      endDate: z
        .string()
        .optional()
        .describe("End date for the offer (YYYY-MM-DD)"),
      duration: z
        .enum([
          "ONE_WEEK",
          "ONE_MONTH",
          "TWO_MONTHS",
          "THREE_MONTHS",
          "SIX_MONTHS",
          "ONE_YEAR",
        ])
        .describe("Duration of the introductory offer period"),
      offerMode: z
        .enum(["PAY_AS_YOU_GO", "PAY_UP_FRONT", "FREE_TRIAL"])
        .describe("The offer mode"),
      numberOfPeriods: z
        .coerce.number()
        .describe("Number of periods the offer is valid for"),
    },
    async ({
      sub_id,
      territory_id,
      startDate,
      endDate,
      duration,
      offerMode,
      numberOfPeriods,
    }) => {
      const attributes: Record<string, unknown> = {
        duration,
        offerMode,
        numberOfPeriods,
      };
      if (startDate !== undefined) attributes.startDate = startDate;
      if (endDate !== undefined) attributes.endDate = endDate;

      const body = {
        data: {
          type: "subscriptionIntroductoryOffers",
          attributes,
          relationships: {
            subscription: {
              data: {
                type: "subscriptions",
                id: sub_id,
              },
            },
            territory: {
              data: {
                type: "territories",
                id: territory_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/subscriptionIntroductoryOffers",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "submit_subscription_group",
    "Submit a subscription group for App Review.",
    {
      subscription_group_id: z
        .string()
        .describe("The subscription group ID to submit for review"),
    },
    async ({ subscription_group_id }) => {
      const body = {
        data: {
          type: "subscriptionGroupSubmissions",
          relationships: {
            subscriptionGroup: {
              data: {
                type: "subscriptionGroups",
                id: subscription_group_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/subscriptionGroupSubmissions",
        body
      );

      return jsonResponse(response);
    }
  );
}
