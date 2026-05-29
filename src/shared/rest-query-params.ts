export type RestListQueryParams = {
  limit?: number;
  filter?: string;
  order_by?: string;
  depth?: number;
  starting_after?: string;
  ending_before?: string;
  viewId?: string;
  omit_null_values?: boolean;
};

export type RestWriteQueryParams = {
  upsert?: boolean;
  depth?: number;
};

export type RestBulkFilterQueryParams = {
  filter?: string;
  depth?: number;
  soft_delete?: boolean;
};

export type RestGroupByQueryParams = RestListQueryParams & {
  group_by?: string;
  aggregate?: string;
  include_records_sample?: boolean;
};

const setBooleanQueryParam = (
  params: Record<string, string | number | boolean | undefined>,
  key: string,
  value: boolean | undefined,
): void => {
  if (value === true) {
    params[key] = 'true';
  }
};

export const restListQueryFromOptions = (
  options: Record<string, unknown>,
): RestListQueryParams => ({
  limit: options.limit ? Number(options.limit) : undefined,
  filter: options.filter as string | undefined,
  order_by: options.orderBy as string | undefined,
  depth: options.depth ? Number(options.depth) : undefined,
  starting_after: options.startingAfter as string | undefined,
  ending_before: options.endingBefore as string | undefined,
  viewId: options.viewId as string | undefined,
  omit_null_values: options.omitNullValues === true,
});

export const restWriteQueryFromOptions = (
  options: Record<string, unknown>,
): RestWriteQueryParams => ({
  upsert: options.upsert === true,
  depth: options.depth ? Number(options.depth) : undefined,
});

export const restBulkFilterQueryFromOptions = (
  options: Record<string, unknown>,
): RestBulkFilterQueryParams => ({
  filter: options.filter as string | undefined,
  depth: options.depth ? Number(options.depth) : undefined,
  soft_delete: options.softDelete === true,
});

export const restGroupByQueryFromOptions = (
  options: Record<string, unknown>,
): RestGroupByQueryParams => ({
  ...restListQueryFromOptions(options),
  group_by: options.groupBy as string | undefined,
  aggregate: options.aggregate as string | undefined,
  include_records_sample: options.includeRecordsSample === true,
});

export const serializeRestListQuery = (
  query?: RestListQueryParams,
): Record<string, string | number | boolean | undefined> | undefined => {
  if (!query) {
    return undefined;
  }

  const params: Record<string, string | number | boolean | undefined> = {
    limit: query.limit,
    filter: query.filter,
    order_by: query.order_by,
    depth: query.depth,
    starting_after: query.starting_after,
    ending_before: query.ending_before,
    viewId: query.viewId,
  };

  setBooleanQueryParam(params, 'omit_null_values', query.omit_null_values);

  return params;
};

export const serializeRestWriteQuery = (
  query?: RestWriteQueryParams,
): Record<string, string | number | boolean | undefined> | undefined => {
  if (!query) {
    return undefined;
  }

  const params: Record<string, string | number | boolean | undefined> = {
    depth: query.depth,
  };

  setBooleanQueryParam(params, 'upsert', query.upsert);

  return params;
};

export const serializeRestBulkFilterQuery = (
  query?: RestBulkFilterQueryParams,
): Record<string, string | number | boolean | undefined> | undefined => {
  if (!query) {
    return undefined;
  }

  const params: Record<string, string | number | boolean | undefined> = {
    filter: query.filter,
    depth: query.depth,
  };

  setBooleanQueryParam(params, 'soft_delete', query.soft_delete);

  return params;
};

export const serializeRestGroupByQuery = (
  query?: RestGroupByQueryParams,
): Record<string, string | number | boolean | undefined> | undefined => {
  if (!query) {
    return undefined;
  }

  const params = serializeRestListQuery(query) ?? {};

  if (query.group_by) {
    params.group_by = query.group_by;
  }

  if (query.aggregate) {
    params.aggregate = query.aggregate;
  }

  setBooleanQueryParam(
    params,
    'include_records_sample',
    query.include_records_sample,
  );

  return params;
};
