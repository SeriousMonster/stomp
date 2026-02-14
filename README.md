# Stomp

An MCP server with 162 tools covering the full App Store Connect API.

[![npm](https://img.shields.io/npm/v/@seriousmonster/app-store-connect-mcp)](https://www.npmjs.com/package/@seriousmonster/app-store-connect-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@seriousmonster/app-store-connect-mcp)](https://www.npmjs.com/package/@seriousmonster/app-store-connect-mcp)
[![license](https://img.shields.io/npm/l/@seriousmonster/app-store-connect-mcp)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/SeriousMonster/stomp)](https://github.com/SeriousMonster/stomp)

## What is this?

Stomp is a [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI assistants interact with the Apple App Store Connect API. It provides 162 dedicated tools covering apps, versions, localizations, TestFlight, builds, bundle IDs, capabilities, submissions, users, devices, reviews, screenshots, previews, analytics, pricing, certificates, provisioning profiles, in-app purchases, subscriptions, Game Center, Xcode Cloud, App Clips, sandbox testing, compliance, app events, phased releases, and more. For anything the dedicated tools don't cover, there's a generic `api_request` escape hatch that can hit any App Store Connect endpoint.

## Prerequisites

- **Node.js 18+**
- An **Apple Developer account** with access to App Store Connect
- An **App Store Connect API key** (.p8 file) with appropriate permissions

## Getting your API key

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **Users and Access** > **Integrations** > **App Store Connect API**
3. Click **Generate API Key** (or request one from your Account Holder)
4. Choose a name and select the role/permissions the key should have
5. Click **Generate**
6. **Download the .p8 file** -- Apple only lets you download it once, so store it somewhere safe
7. Note the **Key ID** shown in the table and the **Issuer ID** at the top of the page -- you'll need both

## Installation

Install globally:

```bash
npm install -g @seriousmonster/app-store-connect-mcp
```

Or run directly without installing:

```bash
npx @seriousmonster/app-store-connect-mcp
```

## Configuration

Stomp requires three environment variables:

| Variable | Description |
|---|---|
| `APP_STORE_CONNECT_KEY_ID` | The Key ID from App Store Connect (e.g., `ABC123DEFG`) |
| `APP_STORE_CONNECT_ISSUER_ID` | The Issuer ID (a UUID) |
| `APP_STORE_CONNECT_P8_PATH` | Absolute path to your .p8 private key file (supports `~`) |

### Claude Code

```bash
claude mcp add app-store-connect \
  -e APP_STORE_CONNECT_KEY_ID=YOUR_KEY_ID \
  -e APP_STORE_CONNECT_ISSUER_ID=YOUR_ISSUER_ID \
  -e APP_STORE_CONNECT_P8_PATH=~/.keys/AuthKey_YOUR_KEY_ID.p8 \
  -- npx @seriousmonster/app-store-connect-mcp
```

### Cursor

Add to your Cursor MCP config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "app-store-connect": {
      "command": "npx",
      "args": ["@seriousmonster/app-store-connect-mcp"],
      "env": {
        "APP_STORE_CONNECT_KEY_ID": "YOUR_KEY_ID",
        "APP_STORE_CONNECT_ISSUER_ID": "YOUR_ISSUER_ID",
        "APP_STORE_CONNECT_P8_PATH": "~/.keys/AuthKey_YOUR_KEY_ID.p8"
      }
    }
  }
}
```

### Generic MCP client

Any MCP client that supports stdio transports can run Stomp. Set the three environment variables and run `npx @seriousmonster/app-store-connect-mcp` as the server command.

## Available tools

### Apps

| Tool | Description |
|---|---|
| `list_apps` | List all apps. Filter by name or bundle ID. |
| `get_app` | Get details for a specific app by ID. |
| `create_app` | Create a new app in App Store Connect. |

### App Store Versions

| Tool | Description |
|---|---|
| `list_app_store_versions` | List versions for an app. Filter by version string, platform, or state. |
| `create_app_store_version` | Create a new version (set version string, platform, release type). |
| `update_app_store_version` | Update a version's string, copyright, release type, or scheduled date. |

### Localizations

| Tool | Description |
|---|---|
| `list_version_localizations` | List all localizations for a version. |
| `get_version_localization` | Get a specific localization by ID. |
| `create_version_localization` | Add a new locale with description, keywords, what's new, etc. |
| `update_version_localization` | Update an existing localization's metadata. |

### TestFlight (Beta)

| Tool | Description |
|---|---|
| `list_beta_groups` | List beta groups for an app. |
| `create_beta_group` | Create a new beta group. |
| `delete_beta_group` | Delete a beta group. |
| `list_beta_testers` | List beta testers. Filter by email, group, or app. |
| `create_beta_tester` | Create a tester and optionally assign to groups. |
| `add_tester_to_beta_group` | Add testers to a beta group. |
| `remove_tester_from_beta_group` | Remove testers from a beta group. |
| `delete_beta_tester` | Remove a tester from all groups and apps. |

### Builds

| Tool | Description |
|---|---|
| `list_builds` | List builds for an app. Filter by version, state, or expiry. |
| `add_build_to_beta_group` | Add builds to a beta group for TestFlight distribution. |

### Bundle IDs

| Tool | Description |
|---|---|
| `list_bundle_ids` | List registered bundle IDs. Filter by identifier, name, or platform. |
| `register_bundle_id` | Register a new bundle ID. |

### Capabilities

| Tool | Description |
|---|---|
| `list_bundle_id_capabilities` | List capabilities enabled for a bundle ID. |
| `enable_bundle_id_capability` | Enable a capability (push notifications, Sign in with Apple, etc.). |
| `disable_bundle_id_capability` | Disable a capability. |

### Submissions

| Tool | Description |
|---|---|
| `create_app_store_version_submission` | Submit a version for App Review. |

### Users & Devices

| Tool | Description |
|---|---|
| `list_users` | List users in your App Store Connect team. Filter by role or username. |
| `list_devices` | List registered devices. Filter by name, platform, status, or UDID. |

### Reviews

| Tool | Description |
|---|---|
| `list_customer_reviews` | List customer reviews for an app. Sort and filter. |
| `get_customer_review` | Get a specific review with response. |
| `create_review_response` | Respond to a customer review. |
| `update_review_response` | Update a review response. |
| `delete_review_response` | Delete a review response. |

### Screenshots & Previews

| Tool | Description |
|---|---|
| `list_screenshot_sets` | List screenshot sets for a localization. |
| `create_screenshot_set` | Create a screenshot set for a display type. |
| `delete_screenshot_set` | Delete a screenshot set. |
| `list_screenshots` | List screenshots in a set. |
| `create_screenshot` | Initiate a screenshot upload. |
| `delete_screenshot` | Delete a screenshot. |
| `list_preview_sets` | List app preview sets for a localization. |
| `create_preview_set` | Create an app preview set. |
| `delete_preview_set` | Delete a preview set. |
| `list_previews` | List previews in a set. |
| `create_preview` | Initiate a preview video upload. |
| `delete_preview` | Delete a preview. |

### Analytics & Reporting

| Tool | Description |
|---|---|
| `create_analytics_report_request` | Request analytics report generation. |
| `list_analytics_report_requests` | List report requests for an app. |
| `get_analytics_report_request` | Get a report request with included reports. |
| `list_analytics_reports` | List reports for a request. Filter by category. |
| `list_analytics_report_instances` | List report instances. Filter by date and granularity. |
| `list_analytics_report_segments` | List data segments for a report instance. |

### Pricing & Territories

| Tool | Description |
|---|---|
| `list_app_price_points` | List price points for an app by territory. |
| `get_app_price_schedule` | Get an app's price schedule. |
| `list_territories` | List all App Store territories. |

### TestFlight (Advanced)

| Tool | Description |
|---|---|
| `list_beta_app_localizations` | List TestFlight app descriptions per locale. |
| `create_beta_app_localization` | Create a TestFlight app localization. |
| `update_beta_app_localization` | Update a TestFlight app localization. |
| `list_beta_build_localizations` | List "What to Test" per locale for a build. |
| `create_beta_build_localization` | Create "What to Test" for a build. |
| `update_beta_build_localization` | Update "What to Test" for a build. |
| `submit_build_for_beta_review` | Submit a build for beta app review. |
| `get_beta_app_review_detail` | Get beta review contact info and demo account. |
| `update_beta_app_review_detail` | Update beta review details. |

### Certificates & Profiles

| Tool | Description |
|---|---|
| `list_certificates` | List signing certificates. |
| `get_certificate` | Get a specific certificate. |
| `create_certificate` | Create a signing certificate from a CSR. |
| `revoke_certificate` | Revoke a signing certificate. |
| `list_profiles` | List provisioning profiles. |
| `get_profile` | Get a provisioning profile with related resources. |
| `create_profile` | Create a provisioning profile. |
| `delete_profile` | Delete a provisioning profile. |

### App Info & Categories

| Tool | Description |
|---|---|
| `list_app_infos` | List app info records with localizations and categories. |
| `get_app_info` | Get app info with localizations. |
| `update_app_info` | Update app categories. |
| `list_app_info_localizations` | List app info localizations. |
| `update_app_info_localization` | Update name, subtitle, privacy policy URL. |
| `list_app_categories` | List all App Store categories. |
| `list_age_rating_declarations` | Get age rating declarations. |
| `update_age_rating_declaration` | Update age rating content descriptions. |

### Phased Releases

| Tool | Description |
|---|---|
| `get_phased_release` | Get phased release status for a version. |
| `create_phased_release` | Start a phased release. |
| `update_phased_release` | Pause, resume, or complete a phased release. |
| `delete_phased_release` | Remove phased release (full rollout). |
| `create_version_release_request` | Manually release a version. |

### In-App Purchases

| Tool | Description |
|---|---|
| `list_in_app_purchases` | List in-app purchases for an app. |
| `get_in_app_purchase` | Get in-app purchase details. |
| `create_in_app_purchase` | Create a new in-app purchase. |
| `update_in_app_purchase` | Update an in-app purchase. |
| `delete_in_app_purchase` | Delete an in-app purchase. |
| `list_iap_localizations` | List localizations for an IAP. |
| `create_iap_localization` | Create an IAP localization. |
| `update_iap_localization` | Update an IAP localization. |
| `delete_iap_localization` | Delete an IAP localization. |
| `list_iap_price_points` | List price points for an IAP. |
| `submit_iap_for_review` | Submit an IAP for review. |

### Subscriptions

| Tool | Description |
|---|---|
| `list_subscription_groups` | List subscription groups for an app. |
| `create_subscription_group` | Create a subscription group. |
| `get_subscription_group` | Get subscription group details. |
| `list_subscriptions` | List subscriptions in a group. |
| `create_subscription` | Create a subscription. |
| `update_subscription` | Update a subscription. |
| `delete_subscription` | Delete a subscription. |
| `list_subscription_localizations` | List subscription localizations. |
| `create_subscription_localization` | Create a subscription localization. |
| `update_subscription_localization` | Update a subscription localization. |
| `delete_subscription_localization` | Delete a subscription localization. |
| `list_subscription_prices` | List subscription prices. |
| `list_subscription_price_points` | List price points for a subscription. |
| `create_subscription_introductory_offer` | Create an introductory offer. |
| `submit_subscription_group` | Submit a subscription group for review. |

### Game Center

| Tool | Description |
|---|---|
| `get_game_center_detail` | Get Game Center config for an app. |
| `list_game_center_leaderboards` | List leaderboards. |
| `create_game_center_leaderboard` | Create a leaderboard. |
| `update_game_center_leaderboard` | Update a leaderboard. |
| `delete_game_center_leaderboard` | Delete a leaderboard. |
| `list_game_center_achievements` | List achievements. |
| `create_game_center_achievement` | Create an achievement. |
| `update_game_center_achievement` | Update an achievement. |
| `delete_game_center_achievement` | Delete an achievement. |
| `list_game_center_leaderboard_sets` | List leaderboard sets. |
| `create_game_center_leaderboard_set` | Create a leaderboard set. |
| `delete_game_center_leaderboard_set` | Delete a leaderboard set. |
| `list_game_center_groups` | List Game Center groups. |
| `create_game_center_group` | Create a Game Center group. |

### Xcode Cloud

| Tool | Description |
|---|---|
| `list_ci_products` | List Xcode Cloud products. |
| `get_ci_product` | Get a CI product with related resources. |
| `list_ci_workflows` | List workflows for a product. |
| `get_ci_workflow` | Get workflow details. |
| `list_ci_build_runs` | List build runs for a workflow. |
| `get_ci_build_run` | Get build run details. |
| `start_ci_build_run` | Start a new build run. |
| `list_ci_build_actions` | List actions in a build run. |
| `list_ci_artifacts` | List artifacts from a build action. |
| `list_ci_test_results` | List test results from a build action. |
| `list_ci_issues` | List issues from a build action. |
| `list_ci_mac_os_versions` | List available macOS versions. |
| `list_ci_xcode_versions` | List available Xcode versions. |

### App Clips

| Tool | Description |
|---|---|
| `list_app_clips` | List App Clips for an app. |
| `get_app_clip` | Get App Clip details. |
| `list_app_clip_default_experiences` | List default experiences for an App Clip. |
| `create_app_clip_default_experience` | Create a default App Clip experience. |
| `update_app_clip_default_experience` | Update an App Clip experience. |
| `delete_app_clip_default_experience` | Delete an App Clip experience. |

### Sandbox Testing

| Tool | Description |
|---|---|
| `list_sandbox_testers` | List sandbox tester accounts. |
| `update_sandbox_tester` | Update sandbox tester settings. |
| `clear_sandbox_tester_purchase_history` | Clear purchase history for sandbox testers. |

### Compliance & Legal

| Tool | Description |
|---|---|
| `list_app_encryption_declarations` | List encryption declarations. |
| `create_app_encryption_declaration` | Create an encryption declaration. |
| `get_app_encryption_declaration` | Get an encryption declaration. |
| `list_eulas` | Get the EULA for an app. |
| `create_eula` | Create a custom EULA. |
| `update_eula` | Update a EULA. |
| `delete_eula` | Delete a custom EULA. |

### App Events

| Tool | Description |
|---|---|
| `list_app_events` | List in-app events. |
| `create_app_event` | Create an in-app event. |
| `update_app_event` | Update an in-app event. |
| `delete_app_event` | Delete an in-app event. |
| `list_app_event_localizations` | List event localizations. |
| `create_app_event_localization` | Create an event localization. |
| `update_app_event_localization` | Update an event localization. |
| `delete_app_event_localization` | Delete an event localization. |

### Generic

| Tool | Description |
|---|---|
| `api_request` | Make an arbitrary request to any App Store Connect API endpoint. |

## The `api_request` escape hatch

The 162 dedicated tools cover the vast majority of the App Store Connect API, but Apple's API surface is enormous. The `api_request` tool lets you hit any endpoint directly for anything that doesn't have a dedicated tool yet.

You provide:
- **method** -- `GET`, `POST`, `PATCH`, or `DELETE`
- **path** -- the API path, e.g. `/v1/apps`, `/v2/inAppPurchases/{id}`
- **params** (optional) -- query parameters as key-value pairs
- **body** (optional) -- a JSON string for POST/PATCH requests, following Apple's JSON:API format

Authentication is handled automatically. Refer to [Apple's API documentation](https://developer.apple.com/documentation/appstoreconnectapi) for available endpoints and request formats.

## License

MIT
