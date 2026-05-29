import type { Command } from 'commander';

import {
    createTwentyAgentProtocolClient,
    loadConfig,
} from '../../core/index.js';
import {
    toolsCatalog,
    toolsExecute,
    toolsLearn,
    toolsList,
    toolsLoadSkills,
    toolsSearchHelp,
} from '../../operations/index.js';
import { handleCliError, printJson, readJsonArg } from '../../shared/cli-utils.js';

export const registerToolsCommands = (program: Command): void => {
  const tools = program
    .command('tools')
    .description('Workspace tool catalog via Twenty /mcp agent API');

  tools
    .command('list')
    .description('List meta-tools exposed at /mcp (JSON-RPC tools/list)')
    .action(async () => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(await toolsList(protocolClient));
      } catch (error) {
        handleCliError(error);
      }
    });

  tools
    .command('catalog')
    .description('Discover all workspace CRM tools (get_tool_catalog)')
    .action(async () => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(await toolsCatalog(protocolClient));
      } catch (error) {
        handleCliError(error);
      }
    });

  tools
    .command('learn <toolNames...>')
    .description('Learn input schemas for catalog tools (learn_tools)')
    .action(async (toolNames: string[]) => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(await toolsLearn(protocolClient, toolNames));
      } catch (error) {
        handleCliError(error);
      }
    });

  tools
    .command('call <toolName> [json]')
    .description('Execute a workspace tool (via execute_tool when needed)')
    .action(async (toolName: string, json?: string) => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(
          await toolsExecute(
            protocolClient,
            toolName,
            readJsonArg(json) ?? {},
          ),
        );
      } catch (error) {
        handleCliError(error);
      }
    });

  tools
    .command('skills <skillNames...>')
    .description('Load agent skills (load_skills)')
    .action(async (skillNames: string[]) => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(await toolsLoadSkills(protocolClient, skillNames));
      } catch (error) {
        handleCliError(error);
      }
    });

  tools
    .command('search <query>')
    .description('Search Twenty help center (search_help_center)')
    .action(async (query: string) => {
      try {
        const protocolClient = createTwentyAgentProtocolClient(loadConfig());

        printJson(await toolsSearchHelp(protocolClient, query));
      } catch (error) {
        handleCliError(error);
      }
    });
};
