export const AGENT_TOOL_DEFINITIONS = [
  {
    name: 'twenty_ping',
    description: 'Verify connectivity and return workspace info',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'twenty_list_objects',
    description: 'List all active CRM objects and fields from metadata GraphQL',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'twenty_rest_list',
    description: 'List records for a CRM object (GET /rest/{object})',
    inputSchema: {
      type: 'object',
      properties: {
        object: {
          type: 'string',
          description: 'Plural object name, e.g. people, companies',
        },
        limit: { type: 'number' },
        filter: { type: 'string' },
        order_by: { type: 'string' },
        depth: { type: 'number' },
        starting_after: { type: 'string' },
        ending_before: { type: 'string' },
        viewId: { type: 'string' },
        omit_null_values: { type: 'boolean' },
      },
      required: ['object'],
    },
  },
  {
    name: 'twenty_rest_get',
    description: 'Get one record by ID (GET /rest/{object}/{id})',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        id: { type: 'string' },
        depth: { type: 'number' },
        omit_null_values: { type: 'boolean' },
      },
      required: ['object', 'id'],
    },
  },
  {
    name: 'twenty_rest_create',
    description:
      'Create a record (POST /rest/{object}); set upsert=true for create-or-update',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        data: { type: 'object' },
        upsert: { type: 'boolean' },
      },
      required: ['object', 'data'],
    },
  },
  {
    name: 'twenty_rest_update',
    description: 'Update a record (PATCH /rest/{object}/{id})',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        id: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['object', 'id', 'data'],
    },
  },
  {
    name: 'twenty_rest_delete',
    description:
      'Delete a record (DELETE /rest/{object}/{id}); set soft_delete=true to soft-delete',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        id: { type: 'string' },
        soft_delete: { type: 'boolean' },
      },
      required: ['object', 'id'],
    },
  },
  {
    name: 'twenty_rest_batch_create',
    description:
      'Batch create records (POST /rest/batch/{object}, max 60); set upsert=true for upsert',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        records: {
          type: 'array',
          items: { type: 'object' },
        },
        upsert: { type: 'boolean' },
      },
      required: ['object', 'records'],
    },
  },
  {
    name: 'twenty_rest_update_many',
    description: 'Bulk update records matching filter (PATCH /rest/{object})',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        data: { type: 'object' },
        filter: { type: 'string' },
        depth: { type: 'number' },
      },
      required: ['object', 'data', 'filter'],
    },
  },
  {
    name: 'twenty_rest_delete_many',
    description:
      'Bulk delete records matching filter (DELETE /rest/{object}); soft_delete=true for soft delete',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        filter: { type: 'string' },
        soft_delete: { type: 'boolean' },
      },
      required: ['object', 'filter'],
    },
  },
  {
    name: 'twenty_rest_restore_many',
    description:
      'Bulk restore soft-deleted records matching filter (PATCH /rest/restore/{object})',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        filter: { type: 'string' },
        depth: { type: 'number' },
      },
      required: ['object', 'filter'],
    },
  },
  {
    name: 'twenty_rest_restore',
    description: 'Restore a soft-deleted record (PATCH /rest/restore/{object}/{id})',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        id: { type: 'string' },
      },
      required: ['object', 'id'],
    },
  },
  {
    name: 'twenty_rest_group_by',
    description: 'Aggregate records (GET /rest/{object}/groupBy)',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        limit: { type: 'number' },
        filter: { type: 'string' },
        order_by: { type: 'string' },
        depth: { type: 'number' },
        starting_after: { type: 'string' },
        ending_before: { type: 'string' },
        viewId: { type: 'string' },
        group_by: { type: 'string' },
        aggregate: { type: 'string' },
        include_records_sample: { type: 'boolean' },
      },
      required: ['object'],
    },
  },
  {
    name: 'twenty_rest_find_duplicates',
    description: 'Find duplicate records (POST /rest/{object}/duplicates)',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['object', 'data'],
    },
  },
  {
    name: 'twenty_rest_merge',
    description: 'Merge records (PATCH /rest/{object}/merge)',
    inputSchema: {
      type: 'object',
      properties: {
        object: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['object', 'data'],
    },
  },
  {
    name: 'twenty_rest_raw',
    description: 'Raw Core REST request under /rest',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
        path: {
          type: 'string',
          description: 'Path under /rest, e.g. /rest/people',
        },
        body: { type: 'object' },
      },
      required: ['method', 'path'],
    },
  },
  {
    name: 'twenty_metadata_list',
    description: 'List metadata REST resource (GET /rest/metadata/{resource})',
    inputSchema: {
      type: 'object',
      properties: {
        resource: {
          type: 'string',
          description:
            'objects, fields, views, viewFields, viewFilters, pageLayouts, …',
        },
        limit: { type: 'number' },
        starting_after: { type: 'string' },
        ending_before: { type: 'string' },
      },
      required: ['resource'],
    },
  },
  {
    name: 'twenty_metadata_raw',
    description: 'Raw Metadata REST request under /rest/metadata',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
        path: { type: 'string' },
        body: { type: 'object' },
      },
      required: ['method', 'path'],
    },
  },
  {
    name: 'twenty_graphql',
    description: 'Run GraphQL against /graphql (core) or /metadata',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: ['core', 'metadata'],
        },
        query: { type: 'string' },
        variables: { type: 'object' },
      },
      required: ['endpoint', 'query'],
    },
  },
  {
    name: 'twenty_tool_catalog',
    description: 'Discover all workspace CRM tools (get_tool_catalog)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'twenty_tool_learn',
    description: 'Learn input schemas for workspace catalog tools',
    inputSchema: {
      type: 'object',
      properties: {
        toolNames: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['toolNames'],
    },
  },
  {
    name: 'twenty_tool_execute',
    description: 'Execute any workspace catalog tool (find_companies, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        toolName: { type: 'string' },
        arguments: { type: 'object' },
      },
      required: ['toolName'],
    },
  },
  {
    name: 'twenty_load_skills',
    description: 'Load agent skills (workflow-building, dashboard-building, …)',
    inputSchema: {
      type: 'object',
      properties: {
        skillNames: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['skillNames'],
    },
  },
  {
    name: 'twenty_search_help',
    description: 'Search Twenty help center documentation',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
  },
] as const;

export type AgentToolName = (typeof AGENT_TOOL_DEFINITIONS)[number]['name'];
