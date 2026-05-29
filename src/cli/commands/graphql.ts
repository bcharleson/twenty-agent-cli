import type { Command } from 'commander';

import { createTwentyClient, loadConfig } from '../../core/index.js';
import {
    graphqlCore,
    graphqlMetadata,
    listObjectsMetadata,
} from '../../operations/index.js';
import { handleCliError, printJson, readJsonArg } from '../../shared/cli-utils.js';

export const registerGraphqlCommands = (program: Command): void => {
  const graphql = program
    .command('graphql')
    .description('GraphQL API (/graphql and /metadata)');

  graphql
    .command('core <query>')
    .description('Run a Core GraphQL query or mutation')
    .option('--vars <json>', 'GraphQL variables JSON')
    .action(async (query: string, options) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(await graphqlCore(client, query, readJsonArg(options.vars)));
      } catch (error) {
        handleCliError(error);
      }
    });

  graphql
    .command('metadata <query>')
    .description('Run a Metadata GraphQL query or mutation')
    .option('--vars <json>', 'GraphQL variables JSON')
    .action(async (query: string, options) => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(
          await graphqlMetadata(client, query, readJsonArg(options.vars)),
        );
      } catch (error) {
        handleCliError(error);
      }
    });

  graphql
    .command('objects')
    .description('List active objects and fields (metadata shortcut)')
    .action(async () => {
      try {
        const client = createTwentyClient(loadConfig());

        printJson(await listObjectsMetadata(client));
      } catch (error) {
        handleCliError(error);
      }
    });
};
