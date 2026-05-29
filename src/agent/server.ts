import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  AGENT_WORKFLOW_INSTRUCTIONS,
  loadConfig,
  TWENTY_ENDPOINTS,
} from '../core/index.js';
import { AGENT_TOOL_DEFINITIONS } from './tool-definitions.js';
import { executeAgentTool } from './tool-handlers.js';

export const createAgentServer = () => {
  const config = loadConfig();

  const server = new Server(
    {
      name: 'twenty-agent-cli',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
      instructions: `${AGENT_WORKFLOW_INSTRUCTIONS}\n\nConnected to: ${config.baseUrl}\nRemote agent endpoint: ${config.baseUrl}${TWENTY_ENDPOINTS.mcp}`,
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: AGENT_TOOL_DEFINITIONS.map((tool) => ({ ...tool })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    return executeAgentTool(
      name as (typeof AGENT_TOOL_DEFINITIONS)[number]['name'],
      (args ?? {}) as Record<string, unknown>,
      config,
    );
  });

  return server;
};

export const runAgentServer = async (): Promise<void> => {
  const server = createAgentServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
};
