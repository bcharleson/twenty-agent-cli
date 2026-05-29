import { Command } from 'commander';

import { loadConfig, resetConfigCache } from '../core/index.js';
import { registerCoreCommands } from './commands/core.js';
import { registerGraphqlCommands } from './commands/graphql.js';
import { registerMetadataCommands } from './commands/metadata.js';
import { registerRestCommands } from './commands/rest.js';
import { registerToolsCommands } from './commands/tools.js';

export const createCliProgram = (): Command => {
  const program = new Command();

  program
    .name('twenty-agent')
    .description('Agent-native CLI for Twenty CRM instances')
    .option('--base-url <url>', 'Twenty instance base URL')
    .option('--api-key <key>', 'Twenty API key')
    .hook('preAction', (thisCommand) => {
      resetConfigCache();
      const options = thisCommand.opts();

      if (options.baseUrl || options.apiKey) {
        loadConfig({
          baseUrl: options.baseUrl,
          apiKey: options.apiKey,
        });
      }
    });

  registerCoreCommands(program);
  registerRestCommands(program);
  registerMetadataCommands(program);
  registerGraphqlCommands(program);
  registerToolsCommands(program);

  return program;
};

export const runCli = (argv: string[]): void => {
  createCliProgram().parse(argv);
};
