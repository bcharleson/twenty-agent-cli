import {
    createTwentyAgentProtocolClient,
    createTwentyClient,
    loadConfig,
    TWENTY_ENDPOINTS,
    type TwentyConfig,
} from '../core/index.js';
import {
    graphqlCore,
    graphqlMetadata,
    listObjectsMetadata,
    metadataList,
    metadataRaw,
    pingWorkspace,
    restCoreBatchCreate,
    restCoreCreate,
    restCoreDelete,
    restCoreDeleteMany,
    restCoreFindDuplicates,
    restCoreGet,
    restCoreGroupBy,
    restCoreList,
    restCoreMerge,
    restCoreRaw,
    restCoreRestore,
    restCoreRestoreMany,
    restCoreUpdate,
    restCoreUpdateMany,
    toolsCatalog,
    toolsExecute,
    toolsLearn,
    toolsLoadSkills,
    toolsSearchHelp,
} from '../operations/index.js';
import type {
  RestBulkFilterQueryParams,
  RestGroupByQueryParams,
  RestListQueryParams,
} from '../shared/rest-query-params.js';
import type { AgentToolName } from './tool-definitions.js';

const textResult = (payload: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
});

const asRecord = (value: unknown): Record<string, unknown> =>
  (value ?? {}) as Record<string, unknown>;

const listQueryFromArgs = (
  toolArguments: Record<string, unknown>,
): RestListQueryParams => ({
  limit: toolArguments.limit as number | undefined,
  filter: toolArguments.filter as string | undefined,
  order_by: toolArguments.order_by as string | undefined,
  depth: toolArguments.depth as number | undefined,
  starting_after: toolArguments.starting_after as string | undefined,
  ending_before: toolArguments.ending_before as string | undefined,
  viewId: toolArguments.viewId as string | undefined,
  omit_null_values: toolArguments.omit_null_values as boolean | undefined,
});

const bulkFilterFromArgs = (
  toolArguments: Record<string, unknown>,
): RestBulkFilterQueryParams => ({
  filter: toolArguments.filter as string | undefined,
  depth: toolArguments.depth as number | undefined,
  soft_delete: toolArguments.soft_delete as boolean | undefined,
});

const groupByQueryFromArgs = (
  toolArguments: Record<string, unknown>,
): RestGroupByQueryParams => ({
  ...listQueryFromArgs(toolArguments),
  group_by: toolArguments.group_by as string | undefined,
  aggregate: toolArguments.aggregate as string | undefined,
  include_records_sample: toolArguments.include_records_sample as
    | boolean
    | undefined,
});

export const executeAgentTool = async (
  name: AgentToolName,
  toolArguments: Record<string, unknown>,
  config: TwentyConfig = loadConfig(),
) => {
  const client = createTwentyClient(config);
  const protocolClient = createTwentyAgentProtocolClient(config);

  switch (name) {
    case 'twenty_ping': {
      const result = await pingWorkspace(client);

      return textResult({
        ...result,
        agentEndpoint: `${config.baseUrl}${TWENTY_ENDPOINTS.mcp}`,
      });
    }

    case 'twenty_list_objects':
      return textResult(await listObjectsMetadata(client));

    case 'twenty_rest_list':
      return textResult(
        await restCoreList(
          client,
          String(toolArguments.object),
          listQueryFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_get':
      return textResult(
        await restCoreGet(
          client,
          String(toolArguments.object),
          String(toolArguments.id),
          listQueryFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_create':
      return textResult(
        await restCoreCreate(
          client,
          String(toolArguments.object),
          asRecord(toolArguments.data),
          {
            upsert: toolArguments.upsert as boolean | undefined,
          },
        ),
      );

    case 'twenty_rest_update':
      return textResult(
        await restCoreUpdate(
          client,
          String(toolArguments.object),
          String(toolArguments.id),
          asRecord(toolArguments.data),
        ),
      );

    case 'twenty_rest_delete':
      return textResult(
        await restCoreDelete(
          client,
          String(toolArguments.object),
          String(toolArguments.id),
          bulkFilterFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_batch_create':
      return textResult(
        await restCoreBatchCreate(
          client,
          String(toolArguments.object),
          (toolArguments.records as Record<string, unknown>[]) ?? [],
          {
            upsert: toolArguments.upsert as boolean | undefined,
          },
        ),
      );

    case 'twenty_rest_update_many':
      return textResult(
        await restCoreUpdateMany(
          client,
          String(toolArguments.object),
          asRecord(toolArguments.data),
          bulkFilterFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_delete_many':
      return textResult(
        await restCoreDeleteMany(
          client,
          String(toolArguments.object),
          bulkFilterFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_restore_many':
      return textResult(
        await restCoreRestoreMany(
          client,
          String(toolArguments.object),
          bulkFilterFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_restore':
      return textResult(
        await restCoreRestore(
          client,
          String(toolArguments.object),
          String(toolArguments.id),
        ),
      );

    case 'twenty_rest_group_by':
      return textResult(
        await restCoreGroupBy(
          client,
          String(toolArguments.object),
          groupByQueryFromArgs(toolArguments),
        ),
      );

    case 'twenty_rest_find_duplicates':
      return textResult(
        await restCoreFindDuplicates(
          client,
          String(toolArguments.object),
          asRecord(toolArguments.data),
        ),
      );

    case 'twenty_rest_merge':
      return textResult(
        await restCoreMerge(
          client,
          String(toolArguments.object),
          asRecord(toolArguments.data),
        ),
      );

    case 'twenty_rest_raw':
      return textResult(
        await restCoreRaw(
          client,
          String(toolArguments.method),
          String(toolArguments.path),
          toolArguments.body as Record<string, unknown> | undefined,
        ),
      );

    case 'twenty_metadata_list':
      return textResult(
        await metadataList(
          client,
          String(toolArguments.resource),
          listQueryFromArgs(toolArguments),
        ),
      );

    case 'twenty_metadata_raw':
      return textResult(
        await metadataRaw(
          client,
          String(toolArguments.method),
          String(toolArguments.path),
          toolArguments.body as Record<string, unknown> | undefined,
        ),
      );

    case 'twenty_graphql': {
      const endpoint = String(toolArguments.endpoint ?? 'core');
      const query = String(toolArguments.query);
      const variables = toolArguments.variables as
        | Record<string, unknown>
        | undefined;

      const result =
        endpoint === 'metadata'
          ? await graphqlMetadata(client, query, variables)
          : await graphqlCore(client, query, variables);

      return textResult(result);
    }

    case 'twenty_tool_catalog':
      return textResult(await toolsCatalog(protocolClient));

    case 'twenty_tool_learn':
      return textResult(
        await toolsLearn(protocolClient, toolArguments.toolNames as string[]),
      );

    case 'twenty_tool_execute':
      return textResult(
        await toolsExecute(
          protocolClient,
          String(toolArguments.toolName),
          asRecord(toolArguments.arguments),
        ),
      );

    case 'twenty_load_skills':
      return textResult(
        await toolsLoadSkills(
          protocolClient,
          toolArguments.skillNames as string[],
        ),
      );

    case 'twenty_search_help':
      return textResult(
        await toolsSearchHelp(protocolClient, String(toolArguments.query)),
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};
