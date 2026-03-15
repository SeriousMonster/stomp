import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, jsonResponse } from "../helpers.js";

export function registerSandboxTools(server: McpServer) {
  server.tool(
    "list_sandbox_testers",
    "List sandbox testers for App Store Connect.",
    {},
    async () => {
      const response = await apiRequest("GET", "/v2/sandboxTesters");

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_sandbox_tester",
    "Update a sandbox tester's settings.",
    {
      id: z.string().describe("The sandbox tester ID"),
      territory: z
        .string()
        .optional()
        .describe("Territory code for the sandbox tester (e.g., USA, GBR)"),
      interruptPurchases: booleanParam
        .optional()
        .describe("Whether to interrupt purchases for testing"),
      subscriptionRenewalRate: z
        .string()
        .optional()
        .describe("Subscription renewal rate for testing"),
    },
    async ({ id, territory, interruptPurchases, subscriptionRenewalRate }) => {
      const attributes: Record<string, unknown> = {};
      if (territory !== undefined) attributes.territory = territory;
      if (interruptPurchases !== undefined)
        attributes.interruptPurchases = interruptPurchases;
      if (subscriptionRenewalRate !== undefined)
        attributes.subscriptionRenewalRate = subscriptionRenewalRate;

      const body = {
        data: {
          type: "sandboxTesters",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v2/sandboxTesters/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "clear_sandbox_tester_purchase_history",
    "Clear purchase history for one or more sandbox testers.",
    {
      tester_ids: z
        .array(z.string())
        .describe("Array of sandbox tester IDs to clear purchase history for"),
    },
    async ({ tester_ids }) => {
      const body = {
        data: {
          type: "sandboxTestersClearPurchaseHistoryRequest",
          relationships: {
            sandboxTesters: {
              data: tester_ids.map((id) => ({
                type: "sandboxTesters",
                id,
              })),
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v2/sandboxTestersClearPurchaseHistoryRequest",
        body
      );

      return jsonResponse(response);
    }
  );
}
