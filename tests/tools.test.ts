import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Mock the client module so tool handlers don't make real HTTP calls
vi.mock("../src/client.js", () => ({
  apiRequest: vi.fn(),
  apiRequestAllPages: vi.fn(),
}));

import { apiRequest, apiRequestAllPages } from "../src/client.js";

import { registerAppTools } from "../src/tools/apps.js";
import { registerVersionTools } from "../src/tools/versions.js";
import { registerLocalizationTools } from "../src/tools/localizations.js";
import { registerBetaTools } from "../src/tools/beta.js";
import { registerBuildTools } from "../src/tools/builds.js";
import { registerBundleIdTools } from "../src/tools/bundle-ids.js";
import { registerSubmissionTools } from "../src/tools/submissions.js";
import { registerGenericTools } from "../src/tools/generic.js";
import { registerUserTools } from "../src/tools/users.js";
import { registerCapabilityTools } from "../src/tools/capabilities.js";

const mockedApiRequest = vi.mocked(apiRequest);
const mockedApiRequestAllPages = vi.mocked(apiRequestAllPages);

function createServerWithAllTools(): McpServer {
  const server = new McpServer({
    name: "test-server",
    version: "0.0.1",
  });

  registerAppTools(server);
  registerVersionTools(server);
  registerLocalizationTools(server);
  registerBetaTools(server);
  registerBuildTools(server);
  registerBundleIdTools(server);
  registerSubmissionTools(server);
  registerGenericTools(server);
  registerUserTools(server);
  registerCapabilityTools(server);

  return server;
}

/**
 * Access the internal registered tools map from the McpServer instance.
 * McpServer stores tools in `_registeredTools` which is a Record<string, RegisteredTool>.
 */
function getRegisteredTools(
  server: McpServer
): Record<string, { handler: Function; description?: string; inputSchema?: unknown }> {
  // Access the private _registeredTools property
  return (server as unknown as { _registeredTools: Record<string, any> })
    ._registeredTools;
}

describe("tool registration", () => {
  it("registers exactly 29 tools", () => {
    const server = createServerWithAllTools();
    const tools = getRegisteredTools(server);
    const toolNames = Object.keys(tools);

    expect(toolNames).toHaveLength(29);
  });

  it("contains all expected tool names", () => {
    const server = createServerWithAllTools();
    const tools = getRegisteredTools(server);
    const toolNames = Object.keys(tools);

    // Apps
    expect(toolNames).toContain("list_apps");
    expect(toolNames).toContain("get_app");
    expect(toolNames).toContain("create_app");

    // Versions
    expect(toolNames).toContain("list_app_store_versions");
    expect(toolNames).toContain("create_app_store_version");
    expect(toolNames).toContain("update_app_store_version");

    // Localizations
    expect(toolNames).toContain("list_version_localizations");
    expect(toolNames).toContain("get_version_localization");
    expect(toolNames).toContain("create_version_localization");
    expect(toolNames).toContain("update_version_localization");

    // Beta / TestFlight
    expect(toolNames).toContain("list_beta_groups");
    expect(toolNames).toContain("create_beta_group");
    expect(toolNames).toContain("list_beta_testers");
    expect(toolNames).toContain("create_beta_tester");
    expect(toolNames).toContain("add_tester_to_beta_group");
    expect(toolNames).toContain("remove_tester_from_beta_group");
    expect(toolNames).toContain("delete_beta_group");
    expect(toolNames).toContain("delete_beta_tester");

    // Builds
    expect(toolNames).toContain("list_builds");
    expect(toolNames).toContain("add_build_to_beta_group");

    // Bundle IDs
    expect(toolNames).toContain("list_bundle_ids");
    expect(toolNames).toContain("register_bundle_id");

    // Submissions
    expect(toolNames).toContain("create_app_store_version_submission");

    // Users
    expect(toolNames).toContain("list_users");
    expect(toolNames).toContain("list_devices");

    // Capabilities
    expect(toolNames).toContain("list_bundle_id_capabilities");
    expect(toolNames).toContain("enable_bundle_id_capability");
    expect(toolNames).toContain("disable_bundle_id_capability");

    // Generic
    expect(toolNames).toContain("api_request");
  });
});

describe("tool handler execution", () => {
  let server: McpServer;

  beforeEach(() => {
    server = createServerWithAllTools();
    mockedApiRequest.mockReset();
    mockedApiRequestAllPages.mockReset();
  });

  it("list_apps handler returns properly serialized JSON, not [object Object]", async () => {
    const mockResponse = {
      data: [
        {
          id: "123456789",
          type: "apps",
          attributes: {
            name: "My Awesome App",
            bundleId: "com.example.awesome",
            sku: "awesome-app-001",
            primaryLocale: "en-US",
          },
        },
      ],
      links: {
        self: "https://api.appstoreconnect.apple.com/v1/apps",
      },
    };

    mockedApiRequest.mockResolvedValueOnce(mockResponse);

    const tools = getRegisteredTools(server);
    const listAppsTool = tools["list_apps"];

    // Call the handler directly with the args the tool expects
    const result = await listAppsTool.handler(
      { limit: 10 },
      {} // extra context (not used by our handlers)
    );

    // The result should have content with properly serialized JSON
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const text = result.content[0].text;

    // It must NOT be "[object Object]"
    expect(text).not.toBe("[object Object]");

    // It should be valid JSON
    const parsed = JSON.parse(text);
    expect(parsed).toEqual(mockResponse);

    // It should be pretty-printed (indented with 2 spaces)
    expect(text).toBe(JSON.stringify(mockResponse, null, 2));
  });

  it("get_app handler calls apiRequest with correct path", async () => {
    const mockResponse = {
      data: {
        id: "999",
        type: "apps",
        attributes: { name: "Test App" },
      },
    };

    mockedApiRequest.mockResolvedValueOnce(mockResponse);

    const tools = getRegisteredTools(server);
    const getAppTool = tools["get_app"];

    const result = await getAppTool.handler(
      { app_id: "999" },
      {}
    );

    // Verify apiRequest was called with correct arguments
    expect(mockedApiRequest).toHaveBeenCalledWith(
      "GET",
      "/v1/apps/999",
      undefined,
      {}
    );

    const text = result.content[0].text;
    const parsed = JSON.parse(text);
    expect(parsed.data.id).toBe("999");
  });

  it("create_beta_group handler sends correct POST body", async () => {
    const mockResponse = {
      data: {
        id: "bg-1",
        type: "betaGroups",
        attributes: { name: "Internal Testers" },
      },
    };

    mockedApiRequest.mockResolvedValueOnce(mockResponse);

    const tools = getRegisteredTools(server);
    const createBetaGroupTool = tools["create_beta_group"];

    await createBetaGroupTool.handler(
      {
        app_id: "app-123",
        name: "Internal Testers",
        publicLinkEnabled: false,
        feedbackEnabled: true,
      },
      {}
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "POST",
      "/v1/betaGroups",
      {
        data: {
          type: "betaGroups",
          attributes: {
            name: "Internal Testers",
            publicLinkEnabled: false,
            feedbackEnabled: true,
          },
          relationships: {
            app: {
              data: {
                type: "apps",
                id: "app-123",
              },
            },
          },
        },
      }
    );
  });

  it("disable_bundle_id_capability handler returns success message for DELETE", async () => {
    // DELETE returns { data: null } (204 No Content)
    mockedApiRequest.mockResolvedValueOnce({ data: null });

    const tools = getRegisteredTools(server);
    const disableTool = tools["disable_bundle_id_capability"];

    const result = await disableTool.handler(
      { capability_id: "cap-xyz" },
      {}
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "DELETE",
      "/v1/bundleIdCapabilities/cap-xyz"
    );

    const text = result.content[0].text;
    const parsed = JSON.parse(text);
    expect(parsed.success).toBe(true);
    expect(parsed.message).toContain("cap-xyz");
  });

  it("api_request generic tool forwards method, path, params, and body", async () => {
    const mockResponse = {
      data: [{ id: "iap-1", type: "inAppPurchases" }],
    };

    mockedApiRequest.mockResolvedValueOnce(mockResponse);

    const tools = getRegisteredTools(server);
    const genericTool = tools["api_request"];

    const result = await genericTool.handler(
      {
        method: "GET",
        path: "/v2/inAppPurchases",
        params: { "filter[app]": "app-123" },
      },
      {}
    );

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "GET",
      "/v2/inAppPurchases",
      undefined,
      { "filter[app]": "app-123" }
    );

    const text = result.content[0].text;
    expect(text).not.toBe("[object Object]");
    const parsed = JSON.parse(text);
    expect(parsed.data).toHaveLength(1);
  });
});
