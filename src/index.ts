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
import { getAuthConfig } from "./auth.js";

const server = new McpServer({
  name: "app-store-connect",
  version: "0.1.0",
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
  console.error("Fatal error:", error);
  process.exit(1);
});
