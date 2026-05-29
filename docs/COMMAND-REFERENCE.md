# Command Reference

Complete map of **Twenty API endpoints → CLI commands → MCP tools** for `twenty-agent-cli`.

Every command accepts global flags:

| Flag | Env var | Description |
|------|---------|-------------|
| `--base-url <url>` | `TWENTY_BASE_URL` | Instance base URL (no trailing slash) |
| `--api-key <key>` | `TWENTY_API_KEY` | API key from Settings → API & Webhooks |

---

## Core

| API | CLI | MCP tool (`twenty-agent serve`) |
|-----|-----|----------------------------------|
| Metadata GraphQL `currentWorkspace` | `twenty-agent ping` | `twenty_ping` |
| Resolved config | `twenty-agent config` | — |
| Stdio MCP server | `twenty-agent serve` | *(this process)* |

### `ping`

```bash
twenty-agent ping
```

Returns `{ ok, workspace: { id, displayName }, agentEndpoint }`.

---

## Core REST — `/rest`

Base path: `{baseUrl}/rest`

### List / get

| API | CLI | Flags | MCP tool |
|-----|-----|-------|----------|
| `GET /{object}` | `rest get <object>` | `--limit`, `--filter`, `--order-by`, `--depth`, `--starting-after`, `--ending-before`, `--view-id`, `--omit-null-values` | `twenty_rest_list` |
| `GET /{object}/{id}` | `rest get <object> <id>` | `--depth`, `--omit-null-values` | `twenty_rest_get` |

```bash
twenty-agent rest get people --limit 10 --filter 'city[eq]:Paris'
twenty-agent rest get people <uuid> --depth 1 --omit-null-values
```

### Create / update / delete

| API | CLI | Flags | MCP tool |
|-----|-----|-------|----------|
| `POST /{object}` | `rest post <object> <json>` | `--upsert` | `twenty_rest_create` |
| `PATCH /{object}/{id}` | `rest patch <object> <id> <json>` | — | `twenty_rest_update` |
| `PATCH /{object}` (bulk) | `rest patch-many <object> <json>` | `--filter` (required), `--depth` | `twenty_rest_update_many` |
| `DELETE /{object}/{id}` | `rest delete <object> <id>` | `--soft-delete` | `twenty_rest_delete` |
| `DELETE /{object}` (bulk) | `rest delete-many <object>` | `--filter` (required), `--soft-delete` | `twenty_rest_delete_many` |

```bash
twenty-agent rest post companies '{"name":"Acme"}' --upsert
twenty-agent rest patch-many people '{"city":"London"}' --filter 'country[eq]:UK'
twenty-agent rest delete people <uuid> --soft-delete
twenty-agent rest delete-many people --filter 'id[eq]:<uuid>' --soft-delete
```

### Batch / restore / analytics

| API | CLI | Flags | MCP tool |
|-----|-----|-------|----------|
| `POST /batch/{object}` | `rest batch <object> <json-array>` | `--upsert` | `twenty_rest_batch_create` |
| `PATCH /restore/{object}/{id}` | `rest restore <object> <id>` | — | `twenty_rest_restore` |
| `PATCH /restore/{object}` (bulk) | `rest restore-many <object>` | `--filter` (required), `--depth` | `twenty_rest_restore_many` |
| `GET /{object}/groupBy` | `rest group-by <object>` | list flags + `--group-by`, `--aggregate`, `--include-records-sample` | `twenty_rest_group_by` |
| `POST /{object}/duplicates` | `rest duplicates <object> <json>` | — | `twenty_rest_find_duplicates` |
| `PATCH /{object}/merge` | `rest merge <object> <json>` | — | `twenty_rest_merge` |

```bash
twenty-agent rest batch companies '[{"name":"A"},{"name":"B"}]' --upsert
twenty-agent rest restore-many companies --filter 'deletedAt[is]:NOT_NULL'
twenty-agent rest group-by companies \
  --group-by '[{"employees":true}]' \
  --aggregate '["countNotEmptyId"]'
```

### Escape hatch

| API | CLI | MCP tool |
|-----|-----|----------|
| Any under `/rest` | `rest raw <method> <path> [json]` | `twenty_rest_raw` |

```bash
twenty-agent rest raw GET /rest/companies --limit 3
twenty-agent rest raw POST /rest/ai '{"prompt":"..."}'
```

---

## Metadata REST — `/rest/metadata`

Base path: `{baseUrl}/rest/metadata`

| Resource path | CLI shortcut | MCP tool |
|---------------|--------------|----------|
| `/objects` | `metadata list objects` | `twenty_metadata_list` |
| `/fields` | `metadata list fields` | `twenty_metadata_list` |
| `/views` | `metadata list views` | `twenty_metadata_list` |
| `/viewFields` | `metadata list viewFields` | `twenty_metadata_list` |
| `/viewFilters` | `metadata list viewFilters` | `twenty_metadata_list` |
| `/viewFilterGroups` | `metadata list viewFilterGroups` | `twenty_metadata_list` |
| `/viewSorts` | `metadata list viewSorts` | `twenty_metadata_list` |
| `/viewGroups` | `metadata list viewGroups` | `twenty_metadata_list` |
| `/pageLayouts` | `metadata list pageLayouts` | `twenty_metadata_list` |
| `/pageLayoutTabs` | `metadata list pageLayoutTabs` | `twenty_metadata_list` |
| `/pageLayoutWidgets` | `metadata list pageLayoutWidgets` | `twenty_metadata_list` |

### Flags (list)

| Flag | Description |
|------|-------------|
| `--limit <n>` | Page size |
| `--starting-after <cursor>` | Forward pagination |
| `--ending-before <cursor>` | Backward pagination |

### Raw

| CLI | MCP tool |
|-----|----------|
| `metadata raw <method> <path> [json]` | `twenty_metadata_raw` |

---

## GraphQL

| Endpoint | CLI | Flags | MCP tool |
|----------|-----|-------|----------|
| `/graphql` | `graphql core <query>` | `--vars <json>` | `twenty_graphql` (`endpoint: "core"`) |
| `/metadata` | `graphql metadata <query>` | `--vars <json>` | `twenty_graphql` (`endpoint: "metadata"`) |
| Objects shortcut | `graphql objects` | — | `twenty_list_objects` |

```bash
twenty-agent graphql metadata 'query { currentWorkspace { displayName } }'
twenty-agent graphql core 'query { people { edges { node { id } } } }' --vars '{"first":5}'
```

---

## Workspace tools — `/mcp`

Twenty's built-in agent API exposes **250+ workspace-specific tools** through five meta-tools.

| Remote meta-tool | CLI | MCP tool (local stdio) |
|------------------|-----|------------------------|
| `tools/list` (JSON-RPC) | `tools list` | — |
| `get_tool_catalog` | `tools catalog` | `twenty_tool_catalog` |
| `learn_tools` | `tools learn <name> [name...]` | `twenty_tool_learn` |
| `execute_tool` | `tools call <name> [json]` | `twenty_tool_execute` |
| `load_skills` | `tools skills <name> [name...]` | `twenty_load_skills` |
| `search_help_center` | `tools search <query>` | `twenty_search_help` |

```bash
twenty-agent tools catalog
twenty-agent tools learn find_companies create_person
twenty-agent tools call find_companies '{"limit":5}'
twenty-agent tools skills workflow-building
twenty-agent tools search "batch upsert"
```

---

## Other Twenty endpoints (via `rest raw`)

Not given dedicated commands — use `rest raw` or workspace catalog tools:

| Path | Typical use |
|------|-------------|
| `/rest/ai` | AI text generation |
| `/rest/dashboards` | Dashboard operations |
| `/rest/front-components` | Front component metadata |
| `/rest/sdk-client/{appId}/core` | SDK client bundle (core) |
| `/rest/sdk-client/{appId}/metadata` | SDK client bundle (metadata) |

---

## MCP tool index (stdio server)

All tools returned by `twenty-agent serve`:

| Tool | Maps to |
|------|---------|
| `twenty_ping` | Connectivity check |
| `twenty_list_objects` | Metadata GraphQL objects query |
| `twenty_rest_list` | Core REST list |
| `twenty_rest_get` | Core REST get |
| `twenty_rest_create` | Core REST create (`upsert` optional) |
| `twenty_rest_update` | Core REST update |
| `twenty_rest_update_many` | Core REST bulk update by filter |
| `twenty_rest_delete` | Core REST delete (`soft_delete` optional) |
| `twenty_rest_delete_many` | Core REST bulk delete by filter |
| `twenty_rest_batch_create` | Core REST batch create (`upsert` optional) |
| `twenty_rest_restore` | Core REST restore |
| `twenty_rest_restore_many` | Core REST bulk restore by filter |
| `twenty_rest_group_by` | Core REST groupBy |
| `twenty_rest_find_duplicates` | Core REST duplicates |
| `twenty_rest_merge` | Core REST merge |
| `twenty_rest_raw` | Core REST escape hatch |
| `twenty_metadata_list` | Metadata REST list |
| `twenty_metadata_raw` | Metadata REST escape hatch |
| `twenty_graphql` | Core or metadata GraphQL |
| `twenty_tool_catalog` | Remote `get_tool_catalog` |
| `twenty_tool_learn` | Remote `learn_tools` |
| `twenty_tool_execute` | Remote `execute_tool` |
| `twenty_load_skills` | Remote `load_skills` |
| `twenty_search_help` | Remote `search_help_center` |

---

## Rate limits

| Limit | Value |
|-------|-------|
| Requests | 100 / minute |
| Batch size | 60 records / request |

See [API-REFERENCE.md](./API-REFERENCE.md) for HTTP details and response shapes.
