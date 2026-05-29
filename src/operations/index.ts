import type { TwentyAgentProtocolClient } from '../core/agent-protocol-client.js';
import type { TwentyClient } from '../core/twenty-client.js';
import type {
  RestBulkFilterQueryParams,
  RestGroupByQueryParams,
  RestListQueryParams,
  RestWriteQueryParams,
} from '../shared/rest-query-params.js';
import {
  serializeRestBulkFilterQuery,
  serializeRestGroupByQuery,
  serializeRestListQuery,
  serializeRestWriteQuery,
} from '../shared/rest-query-params.js';
import { OBJECTS_METADATA_QUERY } from '../shared/cli-utils.js';

export const pingWorkspace = async (client: TwentyClient) => {
  const workspace = await client.verifyConnection();

  return {
    ok: true,
    workspace,
    baseUrl: client.configSnapshot.baseUrl,
  };
};

export const listObjectsMetadata = async (client: TwentyClient) => {
  const response = await client.graphql.metadata(OBJECTS_METADATA_QUERY);

  return response.data;
};

export const restCoreList = async (
  client: TwentyClient,
  object: string,
  query?: RestListQueryParams,
) => {
  const response = await client.restCore.list(
    object,
    serializeRestListQuery(query),
  );

  return response.data;
};

export const restCoreGet = async (
  client: TwentyClient,
  object: string,
  id: string,
  query?: Pick<RestListQueryParams, 'depth' | 'omit_null_values'>,
) => {
  const response = await client.restCore.get(
    object,
    id,
    serializeRestListQuery(query),
  );

  return response.data;
};

export const restCoreCreate = async (
  client: TwentyClient,
  object: string,
  data: Record<string, unknown>,
  query?: RestWriteQueryParams,
) => {
  const response = await client.restCore.create(
    object,
    data,
    serializeRestWriteQuery(query),
  );

  return response.data;
};

export const restCoreUpdate = async (
  client: TwentyClient,
  object: string,
  id: string,
  data: Record<string, unknown>,
) => {
  const response = await client.restCore.update(object, id, data);

  return response.data;
};

export const restCoreDelete = async (
  client: TwentyClient,
  object: string,
  id: string,
  query?: RestBulkFilterQueryParams,
) => {
  const response = await client.restCore.delete(
    object,
    id,
    serializeRestBulkFilterQuery(query),
  );

  return response.data;
};

export const restCoreBatchCreate = async (
  client: TwentyClient,
  object: string,
  records: Record<string, unknown>[],
  query?: RestWriteQueryParams,
) => {
  const response = await client.restCore.createMany(
    object,
    records,
    serializeRestWriteQuery(query),
  );

  return response.data;
};

export const restCoreUpdateMany = async (
  client: TwentyClient,
  object: string,
  data: Record<string, unknown>,
  query: RestBulkFilterQueryParams,
) => {
  const response = await client.restCore.updateMany(
    object,
    data,
    serializeRestBulkFilterQuery(query),
  );

  return response.data;
};

export const restCoreDeleteMany = async (
  client: TwentyClient,
  object: string,
  query: RestBulkFilterQueryParams,
) => {
  const response = await client.restCore.deleteMany(
    object,
    serializeRestBulkFilterQuery(query),
  );

  return response.data;
};

export const restCoreRestoreMany = async (
  client: TwentyClient,
  object: string,
  query: RestBulkFilterQueryParams,
) => {
  const response = await client.restCore.restoreMany(
    object,
    serializeRestBulkFilterQuery(query),
  );

  return response.data;
};

export const restCoreRestore = async (
  client: TwentyClient,
  object: string,
  id: string,
) => {
  const response = await client.restCore.restore(object, id);

  return response.data;
};

export const restCoreGroupBy = async (
  client: TwentyClient,
  object: string,
  query: RestGroupByQueryParams,
) => {
  const response = await client.restCore.groupBy(
    object,
    serializeRestGroupByQuery(query) ?? {},
  );

  return response.data;
};

export const restCoreFindDuplicates = async (
  client: TwentyClient,
  object: string,
  data: Record<string, unknown>,
) => {
  const response = await client.restCore.findDuplicates(object, data);

  return response.data;
};

export const restCoreMerge = async (
  client: TwentyClient,
  object: string,
  data: Record<string, unknown>,
) => {
  const response = await client.restCore.merge(object, data);

  return response.data;
};

export const restCoreRaw = async (
  client: TwentyClient,
  method: string,
  path: string,
  body?: Record<string, unknown>,
) => {
  const response = await client.request({
    method: method.toUpperCase() as 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path,
    body,
  });

  return response.data;
};

export const metadataList = async (
  client: TwentyClient,
  resource: string,
  query?: RestListQueryParams,
) => {
  const response = await client.restMetadata.list(
    resource,
    serializeRestListQuery(query),
  );

  return response.data;
};

export const metadataRaw = async (
  client: TwentyClient,
  method: string,
  path: string,
  body?: Record<string, unknown>,
) => {
  const response = await client.request({
    method: method.toUpperCase() as 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path,
    body,
  });

  return response.data;
};

export const graphqlCore = async (
  client: TwentyClient,
  query: string,
  variables?: Record<string, unknown>,
) => {
  const response = await client.graphql.core(query, variables);

  return response.data;
};

export const graphqlMetadata = async (
  client: TwentyClient,
  query: string,
  variables?: Record<string, unknown>,
) => {
  const response = await client.graphql.metadata(query, variables);

  return response.data;
};

export const toolsList = async (protocolClient: TwentyAgentProtocolClient) =>
  protocolClient.listTools();

export const toolsCatalog = async (protocolClient: TwentyAgentProtocolClient) =>
  protocolClient.getToolCatalog();

export const toolsLearn = async (
  protocolClient: TwentyAgentProtocolClient,
  toolNames: string[],
) => protocolClient.learnTools(toolNames);

export const toolsExecute = async (
  protocolClient: TwentyAgentProtocolClient,
  toolName: string,
  toolArguments: Record<string, unknown>,
) => protocolClient.executeCatalogTool(toolName, toolArguments);

export const toolsLoadSkills = async (
  protocolClient: TwentyAgentProtocolClient,
  skillNames: string[],
) => protocolClient.loadSkills(skillNames);

export const toolsSearchHelp = async (
  protocolClient: TwentyAgentProtocolClient,
  query: string,
) => protocolClient.searchHelpCenter(query);
