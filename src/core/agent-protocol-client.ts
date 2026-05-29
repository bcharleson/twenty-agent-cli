import {
    buildAuthHeaders,
    buildUrl,
    type TwentyConfig,
} from './config.js';
import { REMOTE_AGENT_META_TOOLS, TWENTY_ENDPOINTS } from './endpoints.js';
import { TwentyApiError } from './twenty-client.js';

export type JsonRpcRequest = {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse<T = unknown> = {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export type AgentToolDefinition = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
};

export type AgentToolsListResult = {
  tools: AgentToolDefinition[];
};

export type AgentToolCallResult = {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
};

export type AgentInitializeResult = {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: { name: string; version: string };
  instructions?: string;
};

export class TwentyAgentProtocolClient {
  private requestId = 0;

  constructor(private readonly config: TwentyConfig) {}

  private nextId(): number {
    this.requestId += 1;

    return this.requestId;
  }

  async call<T = unknown>(
    method: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const id = this.nextId();
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const response = await fetch(buildUrl(this.config, TWENTY_ENDPOINTS.mcp), {
      method: 'POST',
      headers: {
        ...buildAuthHeaders(this.config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as JsonRpcResponse<T>;

    if (!response.ok) {
      throw new TwentyApiError(
        `Twenty agent protocol HTTP error: ${response.status}`,
        response.status,
        payload,
      );
    }

    if (payload.error) {
      throw new TwentyApiError(
        `Twenty agent protocol error: ${payload.error.message}`,
        payload.error.code,
        payload.error,
      );
    }

    if (payload.result === undefined) {
      throw new TwentyApiError(
        'Twenty agent protocol response missing result',
        -1,
        payload,
      );
    }

    return payload.result;
  }

  initialize(): Promise<AgentInitializeResult> {
    return this.call<AgentInitializeResult>('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'twenty-agent-cli', version: '0.1.0' },
    });
  }

  listTools(): Promise<AgentToolsListResult> {
    return this.call<AgentToolsListResult>('tools/list');
  }

  callTool(
    name: string,
    arguments_: Record<string, unknown> = {},
  ): Promise<AgentToolCallResult> {
    return this.call<AgentToolCallResult>('tools/call', {
      name,
      arguments: arguments_,
    });
  }

  async executeCatalogTool<T = unknown>(
    toolName: string,
    toolArguments: Record<string, unknown> = {},
  ): Promise<T> {
    if ((REMOTE_AGENT_META_TOOLS as readonly string[]).includes(toolName)) {
      const result = await this.callTool(toolName, toolArguments);

      return this.parseToolResult<T>(result);
    }

    const wrapped = await this.callTool('execute_tool', {
      toolName,
      arguments: toolArguments,
    });

    const parsed = this.parseToolResult<{
      success?: boolean;
      message?: string;
      result?: T;
      error?: string;
    }>(wrapped);

    if (parsed.success === false) {
      throw new TwentyApiError(
        parsed.error ?? parsed.message ?? `execute_tool failed for ${toolName}`,
        -1,
        parsed,
      );
    }

    if (parsed.result !== undefined) {
      return parsed.result;
    }

    return parsed as T;
  }

  parseToolResult<T>(result: AgentToolCallResult): T {
    const textContent = result.content.find(
      (item) => item.type === 'text' && item.text,
    );

    if (!textContent?.text) {
      return result as T;
    }

    try {
      return JSON.parse(textContent.text) as T;
    } catch {
      return textContent.text as T;
    }
  }

  getToolCatalog(): Promise<unknown> {
    return this.executeCatalogTool('get_tool_catalog');
  }

  learnTools(toolNames: string[]): Promise<unknown> {
    return this.executeCatalogTool('learn_tools', { toolNames });
  }

  loadSkills(skillNames: string[]): Promise<unknown> {
    return this.executeCatalogTool('load_skills', { skillNames });
  }

  searchHelpCenter(query: string): Promise<unknown> {
    return this.executeCatalogTool('search_help_center', { query });
  }
}

export const createTwentyAgentProtocolClient = (
  config: TwentyConfig,
): TwentyAgentProtocolClient => new TwentyAgentProtocolClient(config);
