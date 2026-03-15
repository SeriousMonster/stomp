import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, buildParams, jsonResponse } from "../helpers.js";

export function registerComplianceTools(server: McpServer) {
  server.tool(
    "list_app_encryption_declarations",
    "List app encryption declarations for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ app_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appEncryptionDeclarations`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_app_encryption_declaration",
    "Create an app encryption declaration for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      availableOnFrenchStore: booleanParam
        .describe("Whether the app is available on the French App Store"),
      codeValue: z
        .string()
        .optional()
        .describe("The encryption code value"),
      containsProprietaryCryptography: booleanParam
        .describe("Whether the app contains proprietary cryptography"),
      containsThirdPartyCryptography: booleanParam
        .describe("Whether the app contains third-party cryptography"),
      platform: z.enum(["IOS", "MAC_OS"]).describe("The platform"),
      usesEncryption: booleanParam.describe("Whether the app uses encryption"),
      isExempt: booleanParam.describe("Whether the app is exempt from encryption regulations"),
    },
    async ({
      app_id,
      availableOnFrenchStore,
      codeValue,
      containsProprietaryCryptography,
      containsThirdPartyCryptography,
      platform,
      usesEncryption,
      isExempt,
    }) => {
      const attributes: Record<string, unknown> = {
        availableOnFrenchStore,
        containsProprietaryCryptography,
        containsThirdPartyCryptography,
        platform,
        usesEncryption,
        isExempt,
      };
      if (codeValue !== undefined) attributes.codeValue = codeValue;

      const body = {
        data: {
          type: "appEncryptionDeclarations",
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

      const response = await apiRequest(
        "POST",
        "/v1/appEncryptionDeclarations",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_app_encryption_declaration",
    "Get details of a specific app encryption declaration.",
    {
      id: z.string().describe("The app encryption declaration ID"),
    },
    async ({ id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/appEncryptionDeclarations/${id}`
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_eulas",
    "Get the end user license agreement for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
    },
    async ({ app_id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/endUserLicenseAgreement`
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_eula",
    "Create an end user license agreement for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      agreementText: z.string().describe("The EULA agreement text"),
      territory_ids: z
        .array(z.string())
        .optional()
        .describe("Array of territory IDs this EULA applies to"),
    },
    async ({ app_id, agreementText, territory_ids }) => {
      const relationships: Record<string, unknown> = {
        app: {
          data: {
            type: "apps",
            id: app_id,
          },
        },
      };

      if (territory_ids && territory_ids.length > 0) {
        relationships.territories = {
          data: territory_ids.map((id) => ({
            type: "territories",
            id,
          })),
        };
      }

      const body = {
        data: {
          type: "endUserLicenseAgreements",
          attributes: {
            agreementText,
          },
          relationships,
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/endUserLicenseAgreements",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_eula",
    "Update an end user license agreement.",
    {
      id: z.string().describe("The EULA ID"),
      agreementText: z.string().optional().describe("Updated EULA agreement text"),
    },
    async ({ id, agreementText }) => {
      const attributes: Record<string, unknown> = {};
      if (agreementText !== undefined) attributes.agreementText = agreementText;

      const body = {
        data: {
          type: "endUserLicenseAgreements",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/endUserLicenseAgreements/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_eula",
    "Delete an end user license agreement.",
    {
      id: z.string().describe("The EULA ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/endUserLicenseAgreements/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted end user license agreement ${id}`,
      });
    }
  );
}
