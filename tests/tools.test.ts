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
import { registerReviewTools } from "../src/tools/reviews.js";
import { registerScreenshotTools } from "../src/tools/screenshots.js";
import { registerAnalyticsTools } from "../src/tools/analytics.js";
import { registerPricingTools } from "../src/tools/pricing.js";
import { registerBetaDetailTools } from "../src/tools/beta-detail.js";
import { registerCertificateTools } from "../src/tools/certificates.js";
import { registerAppInfoTools } from "../src/tools/app-info.js";
import { registerPhasedReleaseTools } from "../src/tools/phased-releases.js";
import { registerInAppPurchaseTools } from "../src/tools/in-app-purchases.js";
import { registerSubscriptionTools } from "../src/tools/subscriptions.js";
import { registerGameCenterTools } from "../src/tools/game-center.js";
import { registerXcodeCloudTools } from "../src/tools/xcode-cloud.js";
import { registerAppClipTools } from "../src/tools/app-clips.js";
import { registerSandboxTools } from "../src/tools/sandbox.js";
import { registerComplianceTools } from "../src/tools/compliance.js";
import { registerAppEventTools } from "../src/tools/app-events.js";

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
  registerReviewTools(server);
  registerScreenshotTools(server);
  registerAnalyticsTools(server);
  registerPricingTools(server);
  registerBetaDetailTools(server);
  registerCertificateTools(server);
  registerAppInfoTools(server);
  registerPhasedReleaseTools(server);
  registerInAppPurchaseTools(server);
  registerSubscriptionTools(server);
  registerGameCenterTools(server);
  registerXcodeCloudTools(server);
  registerAppClipTools(server);
  registerSandboxTools(server);
  registerComplianceTools(server);
  registerAppEventTools(server);

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
  it("registers exactly 162 tools", () => {
    const server = createServerWithAllTools();
    const tools = getRegisteredTools(server);
    const toolNames = Object.keys(tools);

    expect(toolNames).toHaveLength(162);
  });

  it("contains all expected tool names across all categories", () => {
    const server = createServerWithAllTools();
    const tools = getRegisteredTools(server);
    const toolNames = Object.keys(tools);

    const expectedTools = [
      // Apps
      "list_apps", "get_app", "create_app",
      // Versions
      "list_app_store_versions", "create_app_store_version", "update_app_store_version",
      // Localizations
      "list_version_localizations", "get_version_localization", "create_version_localization", "update_version_localization",
      // Beta / TestFlight
      "list_beta_groups", "create_beta_group", "delete_beta_group",
      "list_beta_testers", "create_beta_tester", "delete_beta_tester",
      "add_tester_to_beta_group", "remove_tester_from_beta_group",
      // Builds
      "list_builds", "add_build_to_beta_group",
      // Bundle IDs
      "list_bundle_ids", "register_bundle_id",
      // Submissions
      "create_app_store_version_submission",
      // Users & Devices
      "list_users", "list_devices",
      // Capabilities
      "list_bundle_id_capabilities", "enable_bundle_id_capability", "disable_bundle_id_capability",
      // Generic
      "api_request",
      // Reviews
      "list_customer_reviews", "get_customer_review", "create_review_response", "update_review_response", "delete_review_response",
      // Screenshots & Previews
      "list_screenshot_sets", "create_screenshot_set", "delete_screenshot_set",
      "list_screenshots", "create_screenshot", "delete_screenshot",
      "list_preview_sets", "create_preview_set", "delete_preview_set",
      "list_previews", "create_preview", "delete_preview",
      // Analytics
      "create_analytics_report_request", "list_analytics_report_requests", "get_analytics_report_request",
      "list_analytics_reports", "list_analytics_report_instances", "list_analytics_report_segments",
      // Pricing
      "list_app_price_points", "get_app_price_schedule", "list_territories",
      // Beta Detail
      "list_beta_app_localizations", "create_beta_app_localization", "update_beta_app_localization",
      "list_beta_build_localizations", "create_beta_build_localization", "update_beta_build_localization",
      "submit_build_for_beta_review", "get_beta_app_review_detail", "update_beta_app_review_detail",
      // Certificates & Profiles
      "list_certificates", "get_certificate", "create_certificate", "revoke_certificate",
      "list_profiles", "get_profile", "create_profile", "delete_profile",
      // App Info
      "list_app_infos", "get_app_info", "update_app_info",
      "list_app_info_localizations", "update_app_info_localization",
      "list_app_categories", "list_age_rating_declarations", "update_age_rating_declaration",
      // Phased Releases
      "get_phased_release", "create_phased_release", "update_phased_release", "delete_phased_release",
      "create_version_release_request",
      // In-App Purchases
      "list_in_app_purchases", "get_in_app_purchase", "create_in_app_purchase", "update_in_app_purchase", "delete_in_app_purchase",
      "list_iap_localizations", "create_iap_localization", "update_iap_localization", "delete_iap_localization",
      "list_iap_price_points", "submit_iap_for_review",
      // Subscriptions
      "list_subscription_groups", "create_subscription_group", "get_subscription_group",
      "list_subscriptions", "create_subscription", "update_subscription", "delete_subscription",
      "list_subscription_localizations", "create_subscription_localization", "update_subscription_localization", "delete_subscription_localization",
      "list_subscription_prices", "list_subscription_price_points",
      "create_subscription_introductory_offer", "submit_subscription_group",
      // Game Center
      "get_game_center_detail",
      "list_game_center_leaderboards", "create_game_center_leaderboard", "update_game_center_leaderboard", "delete_game_center_leaderboard",
      "list_game_center_achievements", "create_game_center_achievement", "update_game_center_achievement", "delete_game_center_achievement",
      "list_game_center_leaderboard_sets", "create_game_center_leaderboard_set", "delete_game_center_leaderboard_set",
      "list_game_center_groups", "create_game_center_group",
      // Xcode Cloud
      "list_ci_products", "get_ci_product", "list_ci_workflows", "get_ci_workflow",
      "list_ci_build_runs", "get_ci_build_run", "start_ci_build_run",
      "list_ci_build_actions", "list_ci_artifacts", "list_ci_test_results", "list_ci_issues",
      "list_ci_mac_os_versions", "list_ci_xcode_versions",
      // App Clips
      "list_app_clips", "get_app_clip",
      "list_app_clip_default_experiences", "create_app_clip_default_experience", "update_app_clip_default_experience", "delete_app_clip_default_experience",
      // Sandbox
      "list_sandbox_testers", "update_sandbox_tester", "clear_sandbox_tester_purchase_history",
      // Compliance
      "list_app_encryption_declarations", "create_app_encryption_declaration", "get_app_encryption_declaration",
      "list_eulas", "create_eula", "update_eula", "delete_eula",
      // App Events
      "list_app_events", "create_app_event", "update_app_event", "delete_app_event",
      "list_app_event_localizations", "create_app_event_localization", "update_app_event_localization", "delete_app_event_localization",
    ];

    for (const name of expectedTools) {
      expect(toolNames, `Missing tool: ${name}`).toContain(name);
    }
  });
});

describe("schema coercion and validation", () => {
  let server: McpServer;

  beforeEach(() => {
    server = createServerWithAllTools();
    mockedApiRequest.mockReset();
    mockedApiRequestAllPages.mockReset();
    mockedApiRequest.mockResolvedValue({ data: [] });
  });

  /**
   * Get the Zod schema for a tool's input.
   * MCP SDK stores schemas in _registeredTools[name].inputSchema as a ZodObject.
   */
  function getToolSchema(name: string) {
    const tools = getRegisteredTools(server);
    return tools[name].inputSchema;
  }

  // --- Number coercion ---

  it("coerces string '10' to number 10 for limit params (list_apps)", () => {
    const schema = getToolSchema("list_apps");
    const parsed = schema.parse({ limit: "10" });
    expect(parsed.limit).toBe(10);
    expect(typeof parsed.limit).toBe("number");
  });

  it("coerces string '50' to number for publicLinkLimit (create_beta_group)", () => {
    const schema = getToolSchema("create_beta_group");
    const parsed = schema.parse({
      app_id: "app-1",
      name: "Test",
      publicLinkLimit: "50",
    });
    expect(parsed.publicLinkLimit).toBe(50);
  });

  it("coerces string '1' to number for groupLevel (create_subscription)", () => {
    const schema = getToolSchema("create_subscription");
    const parsed = schema.parse({
      group_id: "g-1",
      name: "Pro",
      productId: "com.pro",
      subscriptionPeriod: "ONE_MONTH",
      groupLevel: "1",
    });
    expect(parsed.groupLevel).toBe(1);
  });

  it("coerces string '3' to number for numberOfPeriods (create_subscription_introductory_offer)", () => {
    const schema = getToolSchema("create_subscription_introductory_offer");
    const parsed = schema.parse({
      sub_id: "s-1",
      territory_id: "USA",
      duration: "ONE_MONTH",
      offerMode: "FREE_TRIAL",
      numberOfPeriods: "3",
    });
    expect(parsed.numberOfPeriods).toBe(3);
  });

  // --- Boolean coercion ---

  it("coerces string 'true'/'false' to boolean for publicLinkEnabled/feedbackEnabled", () => {
    const schema = getToolSchema("create_beta_group");
    const parsed = schema.parse({
      app_id: "app-1",
      name: "Test",
      publicLinkEnabled: "true",
      feedbackEnabled: "false",
    });
    expect(parsed.publicLinkEnabled).toBe(true);
    expect(parsed.feedbackEnabled).toBe(false);
  });

  it("coerces string 'true' for filter_expired (list_builds)", () => {
    const schema = getToolSchema("list_builds");
    const parsed = schema.parse({
      app_id: "app-1",
      filter_expired: "true",
    });
    expect(parsed.filter_expired).toBe(true);
  });

  it("coerces string 'true' for familySharable (update_in_app_purchase)", () => {
    const schema = getToolSchema("update_in_app_purchase");
    const parsed = schema.parse({
      id: "iap-1",
      familySharable: "true",
    });
    expect(parsed.familySharable).toBe(true);
  });

  it("coerces string 'false' for interruptPurchases (update_sandbox_tester)", () => {
    const schema = getToolSchema("update_sandbox_tester");
    const parsed = schema.parse({
      id: "st-1",
      interruptPurchases: "false",
    });
    expect(parsed.interruptPurchases).toBe(false);
  });

  // --- Enum validation ---

  it("rejects invalid certificate type in create_certificate", () => {
    const schema = getToolSchema("create_certificate");
    expect(() => schema.parse({
      certificateType: "INVALID_TYPE",
      csrContent: "-----BEGIN...",
    })).toThrow();
  });

  it("accepts valid certificate type in create_certificate", () => {
    const schema = getToolSchema("create_certificate");
    const parsed = schema.parse({
      certificateType: "IOS_DEVELOPMENT",
      csrContent: "-----BEGIN...",
    });
    expect(parsed.certificateType).toBe("IOS_DEVELOPMENT");
  });

  it("rejects invalid profile state filter", () => {
    const schema = getToolSchema("list_profiles");
    expect(() => schema.parse({
      filter_profileState: "BOGUS",
    })).toThrow();
  });

  it("rejects invalid in-app purchase type filter", () => {
    const schema = getToolSchema("list_in_app_purchases");
    expect(() => schema.parse({
      app_id: "app-1",
      filter_inAppPurchaseType: "INVALID",
    })).toThrow();
  });

  it("rejects invalid app store version state filter", () => {
    const schema = getToolSchema("list_app_store_versions");
    expect(() => schema.parse({
      app_id: "app-1",
      filter_appStoreState: "NOT_A_STATE",
    })).toThrow();
  });

  it("rejects invalid platform in create_app_encryption_declaration", () => {
    const schema = getToolSchema("create_app_encryption_declaration");
    expect(() => schema.parse({
      app_id: "app-1",
      availableOnFrenchStore: true,
      containsProprietaryCryptography: false,
      containsThirdPartyCryptography: false,
      platform: "WINDOWS",
      usesEncryption: false,
      isExempt: true,
    })).toThrow();
  });

  it("accepts valid platform in create_app_encryption_declaration", () => {
    const schema = getToolSchema("create_app_encryption_declaration");
    const parsed = schema.parse({
      app_id: "app-1",
      availableOnFrenchStore: true,
      containsProprietaryCryptography: false,
      containsThirdPartyCryptography: false,
      platform: "IOS",
      usesEncryption: false,
      isExempt: true,
    });
    expect(parsed.platform).toBe("IOS");
  });

  it("rejects limit below min", () => {
    const schema = getToolSchema("list_apps");
    expect(() => schema.parse({ limit: "0" })).toThrow();
  });

  it("rejects limit above max", () => {
    const schema = getToolSchema("list_apps");
    expect(() => schema.parse({ limit: "201" })).toThrow();
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
