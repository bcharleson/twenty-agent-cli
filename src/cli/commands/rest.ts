import type { Command } from 'commander';

import { createTwentyClient, loadConfig, TWENTY_ENDPOINTS } from '../../core/index.js';
import {
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
} from '../../operations/index.js';
import {
  handleCliError,
  printJson,
  readJsonArg,
  readJsonArrayArg,
} from '../../shared/cli-utils.js';
import {
  addBulkFilterOptions,
  addGroupByOptions,
  addListQueryOptions,
  addSoftDeleteOption,
  addUpsertOption,
} from '../../shared/list-options.js';
import {
  restBulkFilterQueryFromOptions,
  restGroupByQueryFromOptions,
  restListQueryFromOptions,
  restWriteQueryFromOptions,
} from '../../shared/rest-query-params.js';

export const registerRestCommands = (program: Command): void => {
  const rest = program.command('rest').description('Core REST API (/rest)');

  addListQueryOptions(
    rest
      .command('get <object> [id]')
      .description('List records or get one by ID')
      .action(async (object: string, id: string | undefined, options) => {
        try {
          const client = createTwentyClient(loadConfig());
          const query = restListQueryFromOptions(options);

          if (id) {
            printJson(await restCoreGet(client, object, id, query));
          } else {
            printJson(await restCoreList(client, object, query));
          }
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  addUpsertOption(
    rest
      .command('post <object> <json>')
      .description('Create a record (JSON body); use --upsert for create-or-update')
      .action(async (object: string, json: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());

          printJson(
            await restCoreCreate(
              client,
              object,
              readJsonArg(json) ?? {},
              restWriteQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  rest
    .command('patch <object> <id> <json>')
    .description('Update a record (JSON partial body)')
    .action(async (object: string, id: string, json: string) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(
          await restCoreUpdate(
            client,
            object,
            id,
            readJsonArg(json) ?? {},
          ),
        );
      } catch (error) {
        handleCliError(error);
      }
    });

  addBulkFilterOptions(
    rest
      .command('patch-many <object> <json>')
      .description('Bulk update records matching --filter (PATCH /{object})')
      .action(async (object: string, json: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());

          printJson(
            await restCoreUpdateMany(
              client,
              object,
              readJsonArg(json) ?? {},
              restBulkFilterQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  addSoftDeleteOption(
    rest
      .command('delete <object> <id>')
      .description('Delete a record; default is hard delete, use --soft-delete to soft-delete')
      .action(async (object: string, id: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());

          printJson(
            await restCoreDelete(
              client,
              object,
              id,
              restBulkFilterQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  addBulkFilterOptions(
    addSoftDeleteOption(
      rest
        .command('delete-many <object>')
        .description(
          'Bulk delete records matching --filter (DELETE /{object}); default is hard delete',
        ),
    ).action(async (object: string, options) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(
          await restCoreDeleteMany(
            client,
            object,
            restBulkFilterQueryFromOptions(options),
          ),
        );
      } catch (error) {
        handleCliError(error);
      }
    }),
  );

  addUpsertOption(
    rest
      .command('batch <object> <json>')
      .description('Batch create records (JSON array, max 60); use --upsert for upsert')
      .action(async (object: string, json: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());
          const records = readJsonArrayArg(json) as Record<string, unknown>[];

          printJson(
            await restCoreBatchCreate(
              client,
              object,
              records,
              restWriteQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  rest
    .command('restore <object> <id>')
    .description('Restore a soft-deleted record')
    .action(async (object: string, id: string) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(await restCoreRestore(client, object, id));
      } catch (error) {
        handleCliError(error);
      }
    });

  addBulkFilterOptions(
    rest
      .command('restore-many <object>')
      .description('Bulk restore soft-deleted records matching --filter')
      .action(async (object: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());

          printJson(
            await restCoreRestoreMany(
              client,
              object,
              restBulkFilterQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  addGroupByOptions(
    rest
      .command('group-by <object>')
      .description('Aggregate records (GET /{object}/groupBy)')
      .action(async (object: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());

          printJson(
            await restCoreGroupBy(
              client,
              object,
              restGroupByQueryFromOptions(options),
            ),
          );
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  rest
    .command('duplicates <object> <json>')
    .description('Find duplicate records (POST /{object}/duplicates)')
    .action(async (object: string, json: string) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(
          await restCoreFindDuplicates(
            client,
            object,
            readJsonArg(json) ?? {},
          ),
        );
      } catch (error) {
        handleCliError(error);
      }
    });

  rest
    .command('merge <object> <json>')
    .description('Merge records (PATCH /{object}/merge)')
    .action(async (object: string, json: string) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(
          await restCoreMerge(client, object, readJsonArg(json) ?? {}),
        );
      } catch (error) {
        handleCliError(error);
      }
    });

  rest
    .command('raw <method> <path> [json]')
    .description(
      'Raw Core REST request (path under /rest, e.g. people or /rest/companies)',
    )
    .action(async (method: string, path: string, json?: string) => {
      try {
        const client = createTwentyClient(loadConfig());
        const normalizedPath = path.startsWith('/')
          ? path
          : `${TWENTY_ENDPOINTS.restCore}/${path}`;

        printJson(
          await restCoreRaw(
            client,
            method,
            normalizedPath,
            readJsonArg(json),
          ),
        );
      } catch (error) {
        handleCliError(error);
      }
    });
};
