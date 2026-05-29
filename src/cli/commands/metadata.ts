import type { Command } from 'commander';

import { REST_METADATA_RESOURCES } from '../../core/endpoints.js';
import { createTwentyClient, loadConfig, TWENTY_ENDPOINTS } from '../../core/index.js';
import { metadataList, metadataRaw } from '../../operations/index.js';
import {
  handleCliError,
  listQueryFromOptions,
  printJson,
  readJsonArg,
} from '../../shared/cli-utils.js';
import { addMetadataListOptions } from '../../shared/list-options.js';

const METADATA_RESOURCE_NAMES = Object.keys(REST_METADATA_RESOURCES).join(
  ', ',
);

export const registerMetadataCommands = (program: Command): void => {
  const metadata = program
    .command('metadata')
    .description('Metadata REST API (/rest/metadata)');

  addMetadataListOptions(
    metadata
      .command('list <resource>')
      .description(
        `List metadata resources (${METADATA_RESOURCE_NAMES}, or any path segment)`,
      )
      .action(async (resource: string, options) => {
        try {
          const client = createTwentyClient(loadConfig());
          const query = listQueryFromOptions(options);

          printJson(await metadataList(client, resource, query));
        } catch (error) {
          handleCliError(error);
        }
      }),
  );

  metadata
    .command('raw <method> <path> [json]')
    .description(
      'Raw Metadata REST request (path under /rest/metadata, e.g. objects)',
    )
    .action(async (method: string, path: string, json?: string) => {
      try {
        const client = createTwentyClient(loadConfig());
        const normalizedPath = path.startsWith('/')
          ? path
          : `${TWENTY_ENDPOINTS.restMetadata}/${path}`;

        printJson(
          await metadataRaw(
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
