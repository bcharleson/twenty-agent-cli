# API Coverage Matrix

How **twenty-agent-cli** maps to the [Twenty API](https://docs.twenty.com/developers/extend/api) and Twenty server routes. Workspace-specific object names always come from your instance (Settings → API & Webhooks playground or `twenty-agent graphql objects`).

Legend: ✅ first-class CLI + MCP · ⚠️ via `rest raw` / `metadata raw` · ❌ not exposed · 🔗 use native Twenty `/mcp` directly

## Core REST (`/rest`)

| Capability | CLI / MCP | Status |
|------------|-----------|--------|
| List records | `rest get <object>` · `twenty_rest_list` | ✅ |
| Get by ID | `rest get <object> <id>` · `twenty_rest_get` | ✅ |
| Create | `rest post` · `twenty_rest_create` | ✅ |
| Create with upsert | `rest post --upsert` · `upsert: true` | ✅ |
| Update by ID | `rest patch` · `twenty_rest_update` | ✅ |
| Bulk update by filter | `rest patch-many` · `twenty_rest_update_many` | ✅ |
| Hard delete by ID | `rest delete` · `twenty_rest_delete` | ✅ |
| Soft delete by ID | `rest delete --soft-delete` · `soft_delete: true` | ✅ |
| Bulk delete by filter | `rest delete-many` · `twenty_rest_delete_many` | ✅ |
| Batch create (≤60) | `rest batch` · `twenty_rest_batch_create` | ✅ |
| Batch upsert | `rest batch --upsert` | ✅ |
| Restore by ID | `rest restore` · `twenty_rest_restore` | ✅ |
| Bulk restore by filter | `rest restore-many` · `twenty_rest_restore_many` | ✅ |
| Group by / aggregates | `rest group-by` · `twenty_rest_group_by` | ✅ |
| Find duplicates | `rest duplicates` · `twenty_rest_find_duplicates` | ✅ |
| Merge records | `rest merge` · `twenty_rest_merge` | ✅ |
| PUT (undocumented alias) | `rest raw PUT ...` | ⚠️ |
| OpenAPI schema download | `rest raw GET /rest/open-api/core` | ⚠️ |

## Metadata REST (`/rest/metadata`)

| Capability | CLI / MCP | Status |
|------------|-----------|--------|
| List resources | `metadata list <resource>` · `twenty_metadata_list` | ✅ |
| Create / update / delete | `metadata raw POST/PATCH/DELETE ...` | ⚠️ |
| Dedicated metadata CRUD commands | — | ❌ (planned) |

## GraphQL

| Capability | CLI / MCP | Status |
|------------|-----------|--------|
| Core queries/mutations | `graphql core` · `twenty_graphql` | ✅ |
| Metadata queries/mutations | `graphql metadata` · `twenty_graphql` | ✅ |
| List objects shortcut | `graphql objects` · `twenty_list_objects` | ✅ |
| Batch upsert mutations | `graphql core` (manual query) | ✅ |
| Admin panel GraphQL | — | ❌ |

## Native MCP (`/mcp`)

| Capability | CLI / MCP | Status |
|------------|-----------|--------|
| Tool catalog | `tools catalog` · `twenty_tool_catalog` | ✅ |
| Learn tool schemas | `tools learn` · `twenty_tool_learn` | ✅ |
| Execute workspace tools | `tools call` · `twenty_tool_execute` | ✅ |
| Load skills | `tools skills` · `twenty_load_skills` | ✅ |
| Search help | `tools search` · `twenty_search_help` | ✅ |
| 250+ individual workspace tools | via `execute_tool` pipeline | ✅ (by design) |
| OAuth streamable-http MCP | connect directly to `{baseUrl}/mcp` | 🔗 (not this package) |

## Other REST endpoints

| Path | Status |
|------|--------|
| `/rest/ai` | ⚠️ `rest raw` |
| `/rest/dashboards/:id/duplicate` | ⚠️ `rest raw` |
| `/rest/front-components` | ⚠️ `rest raw` |
| `/rest/sdk-client/*` | ⚠️ `rest raw` |

## Verification

Last live-tested against a self-hosted Twenty instance (2026-05-29): `ping`, list, upsert, batch upsert, patch-many, tools catalog.

To verify your instance:

```bash
export TWENTY_BASE_URL=https://your-instance.com
export TWENTY_API_KEY=your_key
twenty-agent ping
twenty-agent rest get companies --limit 1
twenty-agent tools catalog
```

Compare against your workspace OpenAPI:

```bash
twenty-agent rest raw GET /rest/open-api/core
```
