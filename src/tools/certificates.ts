import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { buildParams, jsonResponse } from "../helpers.js";

export function registerCertificateTools(server: McpServer) {
  server.tool(
    "list_certificates",
    "List signing certificates. Filter by type, display name, or serial number.",
    {
      filter_certificateType: z
        .enum(["IOS_DEVELOPMENT", "IOS_DISTRIBUTION", "MAC_APP_DEVELOPMENT", "MAC_APP_DISTRIBUTION", "MAC_INSTALLER_DISTRIBUTION", "DEVELOPER_ID_KEXT", "DEVELOPER_ID_APPLICATION", "DEVELOPMENT", "DISTRIBUTION"])
        .optional()
        .describe("Filter by certificate type"),
      filter_displayName: z.string().optional().describe("Filter by display name"),
      filter_serialNumber: z.string().optional().describe("Filter by serial number"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ filter_certificateType, filter_displayName, filter_serialNumber, limit }) => {
      const params = buildParams({
        "filter[certificateType]": filter_certificateType,
        "filter[displayName]": filter_displayName,
        "filter[serialNumber]": filter_serialNumber,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        "/v1/certificates",
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_certificate",
    "Get details for a specific signing certificate.",
    {
      id: z.string().describe("The certificate ID"),
    },
    async ({ id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/certificates/${id}`
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_certificate",
    "Create a new signing certificate from a CSR.",
    {
      certificateType: z
        .enum(["IOS_DEVELOPMENT", "IOS_DISTRIBUTION", "MAC_APP_DEVELOPMENT", "MAC_APP_DISTRIBUTION", "MAC_INSTALLER_DISTRIBUTION", "DEVELOPER_ID_KEXT", "DEVELOPER_ID_APPLICATION", "DEVELOPMENT", "DISTRIBUTION"])
        .describe("Certificate type"),
      csrContent: z
        .string()
        .describe("The certificate signing request (CSR) content in PEM format"),
    },
    async ({ certificateType, csrContent }) => {
      const body = {
        data: {
          type: "certificates",
          attributes: {
            certificateType,
            csrContent,
          },
        },
      };

      const response = await apiRequest("POST", "/v1/certificates", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "revoke_certificate",
    "Revoke (delete) a signing certificate.",
    {
      id: z.string().describe("The certificate ID to revoke"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/certificates/${id}`);

      return jsonResponse({
        success: true,
        message: `Revoked certificate ${id}`,
      });
    }
  );

  server.tool(
    "list_profiles",
    "List provisioning profiles. Filter by name, type, or state.",
    {
      filter_name: z.string().optional().describe("Filter by profile name"),
      filter_profileType: z
        .enum(["IOS_APP_DEVELOPMENT", "IOS_APP_STORE", "IOS_APP_ADHOC", "IOS_APP_INHOUSE", "MAC_APP_DEVELOPMENT", "MAC_APP_STORE", "MAC_APP_DIRECT", "TVOS_APP_DEVELOPMENT", "TVOS_APP_STORE", "TVOS_APP_ADHOC", "TVOS_APP_INHOUSE", "MAC_CATALYST_APP_DEVELOPMENT", "MAC_CATALYST_APP_STORE", "MAC_CATALYST_APP_DIRECT"])
        .optional()
        .describe("Filter by profile type"),
      filter_profileState: z
        .enum(["ACTIVE", "INVALID"])
        .optional()
        .describe("Filter by profile state"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ filter_name, filter_profileType, filter_profileState, limit }) => {
      const params = buildParams({
        "filter[name]": filter_name,
        "filter[profileType]": filter_profileType,
        "filter[profileState]": filter_profileState,
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        "/v1/profiles",
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_profile",
    "Get details for a specific provisioning profile, optionally including related resources.",
    {
      id: z.string().describe("The profile ID"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., bundleId,certificates,devices)"),
    },
    async ({ id, include }) => {
      const params = buildParams({
        "include": include,
      });

      const response = await apiRequest(
        "GET",
        `/v1/profiles/${id}`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_profile",
    "Create a new provisioning profile.",
    {
      name: z.string().describe("Profile name"),
      profileType: z
        .enum(["IOS_APP_DEVELOPMENT", "IOS_APP_STORE", "IOS_APP_ADHOC", "IOS_APP_INHOUSE", "MAC_APP_DEVELOPMENT", "MAC_APP_STORE", "MAC_APP_DIRECT", "TVOS_APP_DEVELOPMENT", "TVOS_APP_STORE", "TVOS_APP_ADHOC", "TVOS_APP_INHOUSE", "MAC_CATALYST_APP_DEVELOPMENT", "MAC_CATALYST_APP_STORE", "MAC_CATALYST_APP_DIRECT"])
        .describe("Profile type"),
      bundleId_id: z.string().describe("The bundle ID resource ID"),
      certificate_ids: z
        .array(z.string())
        .describe("Array of certificate IDs to include in the profile"),
      device_ids: z
        .array(z.string())
        .optional()
        .describe("Array of device IDs to include (required for development profiles)"),
    },
    async ({ name, profileType, bundleId_id, certificate_ids, device_ids }) => {
      const relationships: Record<string, unknown> = {
        bundleId: {
          data: {
            type: "bundleIds",
            id: bundleId_id,
          },
        },
        certificates: {
          data: certificate_ids.map((id) => ({
            type: "certificates",
            id,
          })),
        },
      };
      if (device_ids && device_ids.length > 0) {
        relationships.devices = {
          data: device_ids.map((id) => ({
            type: "devices",
            id,
          })),
        };
      }

      const body = {
        data: {
          type: "profiles",
          attributes: {
            name,
            profileType,
          },
          relationships,
        },
      };

      const response = await apiRequest("POST", "/v1/profiles", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_profile",
    "Delete a provisioning profile.",
    {
      id: z.string().describe("The profile ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/profiles/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted profile ${id}`,
      });
    }
  );
}
