# AGENTS.md — twenty-agent-cli

Instructions for AI agents and developers using **twenty-agent-cli** after `npm install twenty-agent-cli`.

## What this package is

**twenty-agent-cli** makes any Twenty CRM instance (cloud or self-hosted) operable from:

1. **Shell** — `twenty-agent` CLI
2. **AI assistants** — `twenty-agent serve` (stdio MCP server)

It is **not** the official Twenty app builder (`twenty-sdk`). Use this package to **read/write CRM data** and run Twenty's **250+ workspace tools**.

Only two values change per deployment:

```bash
TWENTY_BASE_URL=https://crm.example.com   # no trailing slash
TWENTY_API_KEY=your_api_key               # Settings → API & Webhooks
```

---

## Install

```bash
npm install -g twenty-agent-cli
# or use npx without global install:
npx twenty-agent-cli ping
```

Create `.env` or export env vars (see `.env.example` in the repo).

Verify:

```bash
twenty-agent ping
```

---

## Agent setup (Cursor, Claude Desktop, etc.)

Add an MCP server entry:

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

For a local dev checkout, use `node /path/to/twenty-agent-cli/bin/twenty-agent.js serve` instead.

---

## Skills — how agents should use Twenty

### Skill 1: Orient before acting

Always start a new session with:

1. **`twenty_ping`** — confirm credentials and workspace
2. **`twenty_list_objects`** — discover object plural names and fields for this workspace

Never guess object names. Custom objects appear here immediately after creation.

### Skill 2: Choose the right API layer

| Task | Prefer |
|------|--------|
| Simple CRUD on known object/fields | `twenty_rest_*` tools |
| Relations, batch upserts, complex filters | `twenty_graphql` with `endpoint: "core"` |
| Schema, views, layouts | `twenty_metadata_list` or `twenty_graphql` with `endpoint: "metadata"` |
| High-level CRM ops (find, create, workflows) | Workspace catalog workflow (Skill 3) |

### Skill 3: Workspace catalog workflow (recommended for CRM tasks)

Twenty exposes **250+ named tools** per workspace (`find_companies`, `create_person`, …). Access them through a fixed pipeline:

```
twenty_tool_catalog  →  twenty_tool_learn  →  twenty_tool_execute
```

**Rules:**

- **Never guess tool names.** Always call `twenty_tool_catalog` first.
- **Never guess argument shapes.** Call `twenty_tool_learn` with exact tool names before `twenty_tool_execute`.
- For workflows, dashboards, or imports, call **`twenty_load_skills`** with relevant skill names (e.g. `workflow-building`) before executing.

Example mental model:

```
1. twenty_tool_catalog        # browse categories
2. twenty_tool_learn          # toolNames: ["find_companies"]
3. twenty_tool_execute        # toolName: "find_companies", arguments: { limit: 10 }
```

### Skill 4: Pagination and filters (REST list)

When using `twenty_rest_list` or `rest get` without an ID:

| Parameter | Example |
|-----------|---------|
| `limit` | `10` |
| `filter` | `city[eq]:Paris` |
| `order_by` | `createdAt[DescNullsLast]` |
| `depth` | `1` (include relations) |
| `starting_after` / `ending_before` | cursor from previous `pageInfo` |

### Skill 5: Batch and upsert operations

| Operation | How |
|-----------|-----|
| Single upsert | `rest post <object> <json> --upsert` or MCP `twenty_rest_create` with `upsert: true` |
| Batch create/upsert (≤60) | `rest batch <object> <json-array> --upsert` or `twenty_rest_batch_create` |
| Bulk update by filter | `rest patch-many <object> <json> --filter '...'` or `twenty_rest_update_many` |
| Bulk soft delete | `rest delete-many <object> --filter '...' --soft-delete` |
| Bulk restore | `rest restore-many <object> --filter '...'` |
| GraphQL batch upsert | `twenty_graphql` core mutations (plural names, e.g. `CreateCompanies`) |

Rate limits: **100 requests/minute**, **60 records/batch** ([Twenty API docs](https://docs.twenty.com/developers/extend/api)).

### Skill 6: When stuck

1. **`twenty_search_help`** — search Twenty documentation
2. **`twenty_rest_raw`** / **`twenty_metadata_raw`** — escape hatch for undocumented paths
3. Fall back to **`twenty_tool_catalog`** for workspace-native operations

---

## CLI quick reference

Full flag listing: [docs/COMMAND-REFERENCE.md](./docs/COMMAND-REFERENCE.md)

```bash
# Core
twenty-agent ping | config | serve

# Core REST
twenty-agent rest get|post|patch|patch-many|delete|delete-many|batch|restore|restore-many|group-by|duplicates|merge|raw ...

# Metadata REST
twenty-agent metadata list <resource> [--limit] [--starting-after] [--ending-before]
twenty-agent metadata raw <method> <path> [json]

# GraphQL
twenty-agent graphql core|metadata <query> [--vars json]
twenty-agent graphql objects

# Workspace tools (/mcp)
twenty-agent tools list|catalog|learn|call|skills|search ...
```

---

## MCP tool catalog (stdio)

| Tool | Use when |
|------|----------|
| `twenty_ping` | Session start / health check |
| `twenty_list_objects` | Discover schema |
| `twenty_rest_*` | Direct record CRUD, bulk ops, batch/merge/duplicates |
| `twenty_metadata_*` | Views, fields, layouts |
| `twenty_graphql` | Complex queries/mutations |
| `twenty_tool_catalog` | Discover workspace CRM tools |
| `twenty_tool_learn` | Get tool JSON schemas |
| `twenty_tool_execute` | Run catalog tools |
| `twenty_load_skills` | Workflow/dashboard/import guidance |
| `twenty_search_help` | Documentation lookup |

---

## Error handling

- Failed API calls return JSON error bodies in MCP text content.
- HTTP **401/403**: invalid or under-scoped API key — check Settings → Members → Roles.
- **404 on object**: wrong plural name — rerun `twenty_list_objects`.
- **Unknown catalog tool**: rerun `twenty_tool_catalog`; do not invent names.

---

## Provisioning a new client instance

1. Set `TWENTY_BASE_URL` and `TWENTY_API_KEY` for that instance
2. `twenty-agent ping`
3. Update MCP config env vars
4. No code or package changes required

---

## Related docs

| Doc | Contents |
|-----|----------|
| [README.md](./README.md) | Overview, architecture, vs `twenty-sdk` |
| [docs/API-REFERENCE.md](./docs/API-REFERENCE.md) | HTTP endpoints, auth, rate limits |
| [docs/COMMAND-REFERENCE.md](./docs/COMMAND-REFERENCE.md) | Every CLI command, flag, and MCP mapping |
| [examples/cursor-agent.json](./examples/cursor-agent.json) | Cursor MCP config template |

---

## Do not confuse with

| Package | Purpose |
|---------|---------|
| `twenty-sdk` / `twenty` | Build and publish Twenty **apps** |
| `twenty-cli` (npm) | Deprecated stub → use `twenty-sdk` |
| **`twenty-agent-cli`** | Operate a Twenty **CRM instance** from agents/shell |
