import { TwentyApiError } from '../core/twenty-client.js';

export const printJson = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};

export const handleCliError = (error: unknown): never => {
  if (error instanceof TwentyApiError) {
    process.stderr.write(`Error: ${error.message}\n`);

    if (error.body) {
      printJson(error.body);
    }

    process.exit(1);
  }

  if (error instanceof Error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }

  process.stderr.write('Unknown error\n');
  process.exit(1);
};

export const readJsonArg = (
  raw?: string,
): Record<string, unknown> | undefined => {
  if (!raw) {
    return undefined;
  }

  return JSON.parse(raw) as Record<string, unknown>;
};

export const readJsonArrayArg = (raw?: string): unknown[] | undefined => {
  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array');
  }

  return parsed;
};

export type {
  RestBulkFilterQueryParams,
  RestGroupByQueryParams,
  RestListQueryParams,
  RestWriteQueryParams,
} from './rest-query-params.js';

export {
  restBulkFilterQueryFromOptions,
  restGroupByQueryFromOptions,
  restListQueryFromOptions,
  restWriteQueryFromOptions,
} from './rest-query-params.js';

/** @deprecated Use RestListQueryParams */
export type ListQueryParams = import('./rest-query-params.js').RestListQueryParams;

/** @deprecated Use restListQueryFromOptions */
export { restListQueryFromOptions as listQueryFromOptions } from './rest-query-params.js';

export const OBJECTS_METADATA_QUERY = `query Objects {
  objects(paging: { first: 1000 }, filter: { isActive: { is: true } }) {
    edges {
      node {
        nameSingular
        namePlural
        labelSingular
        fields(paging: { first: 200 }, filter: { isActive: { is: true } }) {
          edges {
            node { name label type isNullable }
          }
        }
      }
    }
  }
}`;
