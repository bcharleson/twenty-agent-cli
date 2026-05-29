// Twenty CRM API endpoint paths — identical across cloud and self-hosted.
// Only TWENTY_BASE_URL changes per deployment.

export const TWENTY_ENDPOINTS = {
  // Built-in agent server (250+ workspace tools via execute_tool dispatcher)
  mcp: '/mcp',

  // Core record CRUD (schema-generated per workspace)
  restCore: '/rest',

  // Schema / workspace metadata (REST)
  restMetadata: '/rest/metadata',

  // Core GraphQL (records)
  graphqlCore: '/graphql',

  // Metadata GraphQL (objects, fields, workspace)
  graphqlMetadata: '/metadata',

  // SDK client bundles (advanced)
  restSdkClient: '/rest/sdk-client',

  // AI endpoints
  restAi: '/rest/ai',

  // Dashboards
  restDashboards: '/rest/dashboards',
} as const;

export type TwentyEndpointKey = keyof typeof TWENTY_ENDPOINTS;

// Core REST path patterns (object names are workspace-specific plural names)
export const REST_CORE_PATTERNS = {
  list: '/{object}',
  get: '/{object}/{id}',
  create: '/{object}',
  update: '/{object}/{id}',
  delete: '/{object}/{id}',
  batchCreate: '/batch/{object}',
  duplicates: '/{object}/duplicates',
  groupBy: '/{object}/groupBy',
  merge: '/{object}/merge',
  restore: '/restore/{object}/{id}',
} as const;

// Metadata REST resources (fixed paths)
export const REST_METADATA_RESOURCES = {
  objects: '/objects',
  fields: '/fields',
  views: '/views',
  viewFields: '/viewFields',
  viewFilters: '/viewFilters',
  viewFilterGroups: '/viewFilterGroups',
  viewSorts: '/viewSorts',
  viewGroups: '/viewGroups',
  pageLayouts: '/pageLayouts',
  pageLayoutTabs: '/pageLayoutTabs',
  pageLayoutWidgets: '/pageLayoutWidgets',
} as const;

// Meta-tools on Twenty's native /mcp agent endpoint
export const REMOTE_AGENT_META_TOOLS = [
  'execute_tool',
  'learn_tools',
  'load_skills',
  'get_tool_catalog',
  'search_help_center',
] as const;

export type RemoteAgentMetaToolName =
  (typeof REMOTE_AGENT_META_TOOLS)[number];

export const AGENT_WORKFLOW_INSTRUCTIONS =
  'Twenty CRM agent workflow: (1) get_tool_catalog to discover tools, (2) learn_tools to get input schemas, (3) execute_tool to run them. Never guess tool names — always start with get_tool_catalog. Use load_skills for guidance on complex tasks like workflow or dashboard building.';

export const API_RATE_LIMITS = {
  requestsPerMinute: 100,
  batchSize: 60,
} as const;
