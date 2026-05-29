# Twenty CRM API Reference

This document maps the **Twenty API surface** used by `twenty-agent-cli`. Paths are identical for [Twenty Cloud](https://api.twenty.com) and self-hosted deployments — only the **base URL** changes.

| Deployment | Base URL |
|------------|----------|
| Cloud | `https://api.twenty.com` |
| Self-hosted | `https://{your-domain}` |

## Authentication

All requests require a Bearer API key:

```
Authorization: Bearer YOUR_API_KEY
```

Create keys at **Settings → API & Webhooks → + Create key**. Assign a role under **Settings → Members → Roles → Assignment** to scope permissions.

---

## API Layers

Twenty exposes **two API layers**, each in **REST** and **GraphQL**:

| Layer | Purpose | REST | GraphQL |
|-------|---------|------|---------|
| **Core** | CRUD on records (people, companies, custom objects) | `/rest/` | `/graphql` |
| **Metadata** | Schema, objects, fields, views | `/rest/metadata/` | `/metadata` |

Object endpoints are **generated per workspace**. When you add a custom object `Invoice`, you immediately get `/rest/invoices`, `find_invoices` MCP tools, etc.

---

## Core REST API (`/rest/`)

Base: `{baseUrl}/rest`

### Standard CRUD

| Operation | Method | Path | Body |
|-----------|--------|------|------|
| List | `GET` | `/{objectPlural}` | — |
| Get one | `GET` | `/{objectPlural}/{uuid}` | — |
| Create | `POST` | `/{objectPlural}` | record JSON; add `?upsert=true` for upsert |
| Update | `PATCH` | `/{objectPlural}/{uuid}` | partial record |
| Update many | `PATCH` | `/{objectPlural}` | partial record + `filter` query param |
| Delete | `DELETE` | `/{objectPlural}/{uuid}` | hard delete by default |
| Soft delete | `DELETE` | `/{objectPlural}/{uuid}` | add `?soft_delete=true` |
| Delete many | `DELETE` | `/{objectPlural}` | `filter` required; `?soft_delete=true` for soft delete |
| Batch create | `POST` | `/batch/{objectPlural}` | array of records; `?upsert=true` supported |
| Restore | `PATCH` | `/restore/{objectPlural}/{uuid}` | — |
| Restore many | `PATCH` | `/restore/{objectPlural}` | `filter` query param |

**Built-in object plural names** (default workspace): `people`, `companies`, `opportunities`, `notes`, `tasks`, `workflows`, etc. Use `twenty graphql objects` or Settings → API playground to list your workspace objects.

### Advanced

| Operation | Method | Path |
|-----------|--------|------|
| Find duplicates | `POST` | `/{objectPlural}/duplicates` |
| Group by analytics | `GET` | `/{objectPlural}/groupBy` |
| Merge records | `PATCH` | `/{objectPlural}/merge` |

### Query parameters (list / groupBy)

| Param | Example | Description |
|-------|---------|-------------|
| `limit` | `?limit=10` | Page size |
| `starting_after` | `?starting_after={cursor}` | Forward pagination |
| `ending_before` | `?ending_before={cursor}` | Backward pagination |
| `filter` | `?filter=city[eq]:Paris` | Filter expression |
| `order_by` | `?order_by=createdAt[DescNullsLast]` | Sort |
| `depth` | `?depth=1` | Include relations (0–2) |
| `viewId` | `?viewId={uuid}` | Apply saved view filter/sort |
| `omit_null_values` | `?omit_null_values=true` | Omit null fields from response |
| `group_by` | `?group_by=[{"field":true}]` | Group-by dimensions (groupBy only) |
| `aggregate` | `?aggregate=["countNotEmptyId"]` | Aggregate fields (groupBy only) |
| `include_records_sample` | `?include_records_sample=true` | Sample records per group |
| `upsert` | `?upsert=true` | Create-or-update on POST/batch |
| `soft_delete` | `?soft_delete=true` | Soft delete instead of hard delete |

### Response shape (list)

```json
{
  "data": { "people": [/* records */] },
  "pageInfo": { "startCursor", "endCursor", "hasNextPage" },
  "totalCount": 42
}
```

---

## Metadata REST API (`/rest/metadata/`)

Base: `{baseUrl}/rest/metadata`

| Resource | Path |
|----------|------|
| Objects | `/objects` |
| Fields | `/fields` |
| Views | `/views` |
| View fields | `/viewFields` |
| View filters | `/viewFilters` |
| View filter groups | `/viewFilterGroups` |
| View sorts | `/viewSorts` |
| View groups | `/viewGroups` |
| Page layouts | `/pageLayouts` |
| Page layout tabs | `/pageLayoutTabs` |
| Page layout widgets | `/pageLayoutWidgets` |

Supports the same cursor pagination params (`limit`, `starting_after`, `ending_before`).

---

## GraphQL

| Endpoint | URL | Use |
|----------|-----|-----|
| Core | `{baseUrl}/graphql` | Record CRUD, relations, batch upserts |
| Metadata | `{baseUrl}/metadata` | Objects, fields, workspace info |

```bash
# Verify connection
twenty graphql metadata 'query { currentWorkspace { id displayName } }'

# List objects
twenty graphql objects
```

GraphQL supports batch operations (up to **60 records** per request) and batch upserts via plural mutation names (e.g. `CreateCompanies`).

---

## Native MCP Server (`/mcp`)

Twenty ships a **built-in MCP server** at `{baseUrl}/mcp`. It exposes 250+ workspace-specific tools through a small meta-tool surface:

| Meta-tool | Purpose |
|-----------|---------|
| `get_tool_catalog` | Discover all workspace tools by category |
| `learn_tools` | Get JSON schemas for specific tools |
| `execute_tool` | Run any catalog tool (find_companies, create_person, …) |
| `load_skills` | Load agent skills (workflow-building, xlsx, etc.) |
| `search_help_center` | Search Twenty documentation |

**Recommended agent workflow:**

1. `get_tool_catalog` → discover tools
2. `learn_tools` → get schemas
3. `execute_tool` → run operations
4. `load_skills` → for complex domains (workflows, dashboards)

`twenty-agent-cli` bridges this to Cursor/Claude via `twenty-agent serve` **and** exposes direct REST shortcuts.

---

## Other endpoints

| Path | Purpose |
|------|---------|
| `/rest/ai` | AI text generation |
| `/rest/dashboards` | Dashboard operations |
| `/rest/front-components` | Front component metadata |
| `/rest/sdk-client/{appId}/core` | SDK client bundle (core) |
| `/rest/sdk-client/{appId}/metadata` | SDK client bundle (metadata) |

---

## Rate limits

| Limit | Value |
|-------|-------|
| Requests | 100 / minute |
| Batch size | 60 records / request |

---

## Provisioning a new client

For each deployed Twenty instance:

1. Set `TWENTY_BASE_URL=https://{client-domain}` (no trailing slash)
2. Create an API key in that instance's Settings
3. Set `TWENTY_API_KEY=...`
4. Run `twenty-agent ping` to verify
5. Add agent config pointing at `twenty-agent serve` with those env vars

No code changes required — paths and tooling are identical across instances.
