import type { Command } from 'commander';

import { runAgentServer } from '../../agent/server.js';
import {
  createTwentyClient,
  loadConfig,
  TWENTY_ENDPOINTS,
} from '../../core/index.js';
import { pingWorkspace } from '../../operations/index.js';
import { handleCliError, printJson } from '../../shared/cli-utils.js';

export const registerCoreCommands = (program: Command): void => {
  program
    .command('config')
    .description('Show resolved configuration (API key redacted)')
    .action(() => {
      const config = loadConfig();

      printJson({
        baseUrl: config.baseUrl,
        apiKey: `${config.apiKey.slice(0, 6)}…`,
        endpoints: TWENTY_ENDPOINTS,
      });
    });

  program
    .command('ping')
    .description('Verify API key and workspace connectivity')
    .action(async () => {
      try {
        const client = createTwentyClient(loadConfig());
        const result = await pingWorkspace(client);

        printJson({
          ...result,
          agentEndpoint: `${loadConfig().baseUrl}${TWENTY_ENDPOINTS.mcp}`,
        });
      } catch (error) {
        handleCliError(error);
      }
    });

  program
    .command('serve')
    .description(
      'Start stdio MCP server for Cursor, Claude Desktop, and other AI assistants',
    )
    .action(async () => {
      try {
        await runAgentServer();
      } catch (error) {
        handleCliError(error);
      }
    });
};
