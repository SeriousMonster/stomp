#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAppTools } from "./tools/apps.js";
import { registerVersionTools } from "./tools/versions.js";
import { registerLocalizationTools } from "./tools/localizations.js";
import { registerBetaTools } from "./tools/beta.js";
import { registerBuildTools } from "./tools/builds.js";
import { registerBundleIdTools } from "./tools/bundle-ids.js";
import { registerSubmissionTools } from "./tools/submissions.js";
import { registerGenericTools } from "./tools/generic.js";
import { registerUserTools } from "./tools/users.js";
import { registerCapabilityTools } from "./tools/capabilities.js";
import { registerReviewTools } from "./tools/reviews.js";
import { registerScreenshotTools } from "./tools/screenshots.js";
import { registerAnalyticsTools } from "./tools/analytics.js";
import { registerPricingTools } from "./tools/pricing.js";
import { registerBetaDetailTools } from "./tools/beta-detail.js";
import { registerCertificateTools } from "./tools/certificates.js";
import { registerAppInfoTools } from "./tools/app-info.js";
import { registerPhasedReleaseTools } from "./tools/phased-releases.js";
import { registerInAppPurchaseTools } from "./tools/in-app-purchases.js";
import { registerSubscriptionTools } from "./tools/subscriptions.js";
import { registerGameCenterTools } from "./tools/game-center.js";
import { registerXcodeCloudTools } from "./tools/xcode-cloud.js";
import { registerAppClipTools } from "./tools/app-clips.js";
import { registerSandboxTools } from "./tools/sandbox.js";
import { registerComplianceTools } from "./tools/compliance.js";
import { registerAppEventTools } from "./tools/app-events.js";
import { getAuthConfig } from "./auth.js";

const server = new McpServer({
  name: "app-store-connect",
  version: "0.2.1",
});

// Register all tool groups
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

async function main() {
  // Validate auth config early so we fail fast with a clear error
  try {
    getAuthConfig();
  } catch (error) {
    console.error(
      `Auth configuration error: ${error instanceof Error ? error.message : error}`
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
