# Stomp

An MCP server for the Apple App Store Connect API.

[![npm](https://img.shields.io/npm/v/@seriousmonster/app-store-connect-mcp)](https://www.npmjs.com/package/@seriousmonster/app-store-connect-mcp)
[![license](https://img.shields.io/npm/l/@seriousmonster/app-store-connect-mcp)](./LICENSE)

## What is this?

Stomp is a [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI assistants interact with the Apple App Store Connect API. It provides typed tools for managing apps, App Store versions, localizations, TestFlight beta groups and testers, builds, bundle IDs, capabilities, submissions, users, and devices. For anything the dedicated tools don't cover, there's a generic `api_request` escape hatch that can hit any App Store Connect endpoint.

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

### Generic

| Tool | Description |
|---|---|
| `api_request` | Make an arbitrary request to any App Store Connect API endpoint. |

## The `api_request` escape hatch

The dedicated tools above cover the most common operations, but the App Store Connect API has hundreds of endpoints. The `api_request` tool lets you hit any of them directly.

You provide:
- **method** -- `GET`, `POST`, `PATCH`, or `DELETE`
- **path** -- the API path, e.g. `/v1/apps`, `/v2/inAppPurchases/{id}`
- **params** (optional) -- query parameters as key-value pairs
- **body** (optional) -- a JSON string for POST/PATCH requests, following Apple's JSON:API format

Authentication is handled automatically. Refer to [Apple's API documentation](https://developer.apple.com/documentation/appstoreconnectapi) for available endpoints and request formats.

Example use cases for `api_request`:
- In-app purchases and subscriptions (`/v2/inAppPurchases`)
- App pricing and availability (`/v1/appPrices`)
- Customer reviews and responses (`/v1/customerReviews`)
- App clips (`/v1/appClips`)
- Anything else Apple adds to the API

## License

MIT
