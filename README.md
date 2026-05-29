# twenty-agent-cli

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Agent-native CLI and stdio MCP bridge for **[Twenty CRM](https://twenty.com)** — cloud or self-hosted.

Point at any instance with two env vars: `TWENTY_BASE_URL` and `TWENTY_API_KEY`. API paths (`/rest`, `/graphql`, `/metadata`, `/mcp`) are identical everywhere; only the base URL changes per deployment.

## How this differs from official Twenty tooling

| Package | npm | Purpose |
|---------|-----|---------|
| **`twenty-cli`** | Taken (deprecated stub) | Redirects to `twenty-sdk` |
| **`twenty-sdk`** | Active | Official **`twenty`** CLI for **building Twenty apps** — auth, `app:dev`, `entity:add`, `app:publish` |
| **`twenty-agent-cli`** | This repo | **Operating a Twenty CRM instance** — REST/GraphQL from the shell + stdio bridge to Twenty's built-in `/mcp` (250+ workspace tools) |

Use `twenty-sdk` when you are developing a Twenty app. Use **`twenty-agent`** when you want AI assistants or scripts to read and write CRM data.

## Why this exists

Twenty already ships:

- **Schema-generated REST + GraphQL** for every workspace object ([API docs](https://docs.twenty.com/developers/extend/api))
- A **native agent endpoint** at `/mcp` with 250+ catalog tools (`find_companies`, `create_person`, workflow tools, etc.)

This repo wraps those capabilities for **Cursor, Claude Desktop, and shell scripts** so each deployment becomes agent-native with zero code changes — swap base URL and API key only.

## Quick start

### From npm (when published)

```bash
npm install -g twenty-agent-cli
export TWENTY_BASE_URL=https://crm.example.com
export TWENTY_API_KEY=your_api_key
twenty-agent ping
```

Or without a global install:

```bash
npx twenty-agent-cli ping
```

### From source

```bash
git clone https://github.com/bcharleson/twenty-agent-cli.git
cd twenty-agent-cli
npm install
cp .env.example .env
# Edit .env with your base URL + API key

npm run build
npm link   # optional — installs `twenty-agent` globally

twenty-agent ping
twenty-agent graphql objects
twenty-agent tools catalog
```

### Environment

| Variable | Required | Example |
|----------|----------|---------|
| `TWENTY_BASE_URL` | Yes | `https://crm.example.com` |
| `TWENTY_API_KEY` | Yes | From Settings → API & Webhooks |
| `TWENTY_WORKSPACE_SUBDOMAIN` | No | Multi-tenant routing (rare) |

## CLI

```bash
# Connectivity
twenty-agent ping
twenty-agent config

# REST Core API
twenty-agent rest get people --limit 5
twenty-agent rest get people <uuid>
twenty-agent rest post people '{"name":{"firstName":"Ada","lastName":"Lovelace"}}'
twenty-agent rest post people '{"name":"Acme"}' --upsert
twenty-agent rest patch people <uuid> '{"city":"London"}'
twenty-agent rest patch-many people '{"city":"London"}' --filter 'country[eq]:UK'
twenty-agent rest delete people <uuid>
twenty-agent rest delete people <uuid> --soft-delete
twenty-agent rest delete-many people --filter 'id[eq]:<uuid>' --soft-delete
twenty-agent rest batch people '[{"name":{"firstName":"Ada"}}]' --upsert
twenty-agent rest restore people <uuid>
twenty-agent rest restore-many people --filter 'deletedAt[is]:NOT_NULL'
twenty-agent rest group-by companies --group-by '[{"employees":true}]' --aggregate '["countNotEmptyId"]'

# GraphQL
twenty-agent graphql metadata 'query { currentWorkspace { displayName } }'
twenty-agent graphql objects

# Twenty workspace tool catalog (remote /mcp)
twenty-agent tools list
twenty-agent tools catalog
twenty-agent tools learn find_companies create_person
twenty-agent tools call find_companies '{"limit":5}'
twenty-agent tools skills workflow-building
twenty-agent tools search "batch upsert"

# Metadata REST
twenty-agent metadata list objects --limit 20
twenty-agent metadata list fields

# Stdio agent server (for Cursor / Claude Desktop)
twenty-agent serve
```

Override config per invocation:

```bash
twenty-agent --base-url https://crm.client.com --api-key sk_... ping
```

## Agent server (Cursor / Claude Desktop)

Add to `.cursor/mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "npx",
      "args": ["-y", "twenty-agent-cli", "serve"],
      "env": {
        "TWENTY_BASE_URL": "https://crm.example.com",
        "TWENTY_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

For local development, use `node /path/to/twenty-agent-cli/bin/twenty-agent.js serve` instead. See [examples/](./examples/) for copy-paste configs.

### Tools exposed by `twenty-agent serve`

24 stdio MCP tools including direct REST shortcuts (`twenty_rest_*`), GraphQL, metadata, and the workspace catalog workflow (`twenty_tool_catalog` → `twenty_tool_learn` → `twenty_tool_execute`).

See [AGENTS.md](./AGENTS.md) for agent workflow guidance and [docs/COMMAND-REFERENCE.md](./docs/COMMAND-REFERENCE.md) for the full mapping.

## Documentation

| Doc | Contents |
|-----|----------|
| [AGENTS.md](./AGENTS.md) | **Start here for AI agents** — skills, MCP setup, workflows |
| [docs/COMMAND-REFERENCE.md](./docs/COMMAND-REFERENCE.md) | Every CLI command, flag, and MCP tool |
| [docs/API-REFERENCE.md](./docs/API-REFERENCE.md) | HTTP endpoints, auth, rate limits |
| [docs/API-COVERAGE.md](./docs/API-COVERAGE.md) | Coverage matrix vs Twenty server API |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development and PR guidelines |

### Endpoint summary

| Path | Purpose |
|------|---------|
| `{baseUrl}/rest/` | Core REST — record CRUD |
| `{baseUrl}/graphql` | Core GraphQL |
| `{baseUrl}/rest/metadata/` | Metadata REST — schema |
| `{baseUrl}/metadata` | Metadata GraphQL |
| `{baseUrl}/mcp` | Native agent API (250+ tools) |

## Provisioning a new client

1. Deploy Twenty at `https://crm.{client}.com`
2. Create API key in that workspace (Settings → API & Webhooks)
3. Set `TWENTY_BASE_URL` + `TWENTY_API_KEY`
4. Update agent MCP config env vars
5. Run `twenty-agent ping`

No repo changes needed.

## Architecture

```
┌─────────────────┐     stdio      ┌───────────────────┐     HTTPS      ┌─────────────────────┐
│ Cursor / Claude │ ◄────────────► │ twenty-agent-cli  │ ◄────────────► │  Twenty CRM Instance │
│                 │                │  twenty-agent     │   /rest        │  (any base URL)      │
└─────────────────┘                │  serve            │   /graphql     └─────────────────────┘
                                   │                   │   /metadata
┌─────────────────┐     shell      │  twenty-agent CLI │   /mcp
│ Humans / CI     │ ◄────────────► └───────────────────┘
└─────────────────┘
```

Twenty also supports connecting **directly** to `{baseUrl}/mcp` via streamable-http + OAuth ([MCP docs](https://docs.twenty.com/user-guide/ai/capabilities/mcp)). Use this package when your client only supports stdio MCP or when you want first-class REST/GraphQL CLI commands.

## Development

```bash
npm run dev -- ping
npm run dev:serve
npm run typecheck
npm run build
```

## License

[MIT](./LICENSE)

## Disclaimer

This is a community tool and is **not** affiliated with or maintained by the Twenty team. For official Twenty development tooling, use [twenty-sdk](https://www.npmjs.com/package/twenty-sdk).
