import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerBetaTools(server: McpServer) {
  server.tool(
    "list_beta_groups",
    "List beta groups for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      filter_name: z.string().optional().describe("Filter by group name"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., betaTesters,builds,app)"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ app_id, filter_name, include, limit }) => {
      const params: Record<string, string> = {
        "filter[app]": app_id,
      };
      if (filter_name) params["filter[name]"] = filter_name;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        "/v1/betaGroups",
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "create_beta_group",
    "Create a new beta group for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      name: z.string().describe("Name of the beta group"),
      publicLinkEnabled: z
        .boolean()
        .optional()
        .default(false)
        .describe("Enable public link for testers"),
      publicLinkLimit: z
        .number()
        .optional()
        .describe("Max number of testers via public link"),
      feedbackEnabled: z
        .boolean()
        .optional()
        .default(true)
        .describe("Enable feedback from testers"),
    },
    async ({
      app_id,
      name,
      publicLinkEnabled,
      publicLinkLimit,
      feedbackEnabled,
    }) => {
      const attributes: Record<string, unknown> = {
        name,
        publicLinkEnabled,
        feedbackEnabled,
      };
      if (publicLinkLimit !== undefined)
        attributes.publicLinkLimit = publicLinkLimit;

      const body = {
        data: {
          type: "betaGroups",
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

      const response = await apiRequest("POST", "/v1/betaGroups", body);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "list_beta_testers",
    "List beta testers, optionally filtered by email, beta group, or app.",
    {
      filter_email: z.string().optional().describe("Filter by tester email"),
      filter_betaGroups: z
        .string()
        .optional()
        .describe("Filter by beta group ID"),
      filter_apps: z.string().optional().describe("Filter by app ID"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., betaGroups,apps,builds)"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ filter_email, filter_betaGroups, filter_apps, include, limit }) => {
      const params: Record<string, string> = {};
      if (filter_email) params["filter[email]"] = filter_email;
      if (filter_betaGroups) params["filter[betaGroups]"] = filter_betaGroups;
      if (filter_apps) params["filter[apps]"] = filter_apps;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        "/v1/betaTesters",
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "create_beta_tester",
    "Create a new beta tester and optionally add them to beta groups.",
    {
      email: z.string().describe("Tester's email address"),
      firstName: z.string().optional().describe("Tester's first name"),
      lastName: z.string().optional().describe("Tester's last name"),
      betaGroupIds: z
        .array(z.string())
        .optional()
        .describe("Beta group IDs to add the tester to"),
    },
    async ({ email, firstName, lastName, betaGroupIds }) => {
      const attributes: Record<string, unknown> = { email };
      if (firstName !== undefined) attributes.firstName = firstName;
      if (lastName !== undefined) attributes.lastName = lastName;

      const relationships: Record<string, unknown> = {};
      if (betaGroupIds && betaGroupIds.length > 0) {
        relationships.betaGroups = {
          data: betaGroupIds.map((id) => ({
            type: "betaGroups",
            id,
          })),
        };
      }

      const body = {
        data: {
          type: "betaTesters",
          attributes,
          ...(Object.keys(relationships).length > 0 ? { relationships } : {}),
        },
      };

      const response = await apiRequest("POST", "/v1/betaTesters", body);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "add_tester_to_beta_group",
    "Add one or more beta testers to a beta group.",
    {
      beta_group_id: z.string().describe("The beta group ID"),
      tester_ids: z
        .array(z.string())
        .describe("Array of beta tester IDs to add"),
    },
    async ({ beta_group_id, tester_ids }) => {
      const body = {
        data: tester_ids.map((id) => ({
          type: "betaTesters",
          id,
        })),
      };

      await apiRequest(
        "POST",
        `/v1/betaGroups/${beta_group_id}/relationships/betaTesters`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: `Added ${tester_ids.length} tester(s) to beta group ${beta_group_id}`,
            }),
          },
        ],
      };
    }
  );

  server.tool(
    "remove_tester_from_beta_group",
    "Remove one or more beta testers from a beta group.",
    {
      beta_group_id: z.string().describe("The beta group ID"),
      tester_ids: z
        .array(z.string())
        .describe("Array of beta tester IDs to remove"),
    },
    async ({ beta_group_id, tester_ids }) => {
      const body = {
        data: tester_ids.map((id) => ({
          type: "betaTesters",
          id,
        })),
      };

      await apiRequest(
        "DELETE",
        `/v1/betaGroups/${beta_group_id}/relationships/betaTesters`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: `Removed ${tester_ids.length} tester(s) from beta group ${beta_group_id}`,
            }),
          },
        ],
      };
    }
  );
}
