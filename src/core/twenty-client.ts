import {
    buildAuthHeaders,
    buildUrl,
    type TwentyConfig,
} from './config.js';
import { TWENTY_ENDPOINTS } from './endpoints.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type TwentyRequestOptions = {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

export type TwentyResponse<T = unknown> = {
  status: number;
  data: T;
  headers: Headers;
};

export class TwentyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'TwentyApiError';
  }
}

const buildQueryString = (
  query?: Record<string, string | number | boolean | undefined>,
): string => {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();

  return serialized ? `?${serialized}` : '';
};

export class TwentyClient {
  constructor(private readonly config: TwentyConfig) {}

  get configSnapshot(): TwentyConfig {
    return this.config;
  }

  urlFor(path: string): string {
    return buildUrl(this.config, path);
  }

  async request<T = unknown>(
    options: TwentyRequestOptions,
  ): Promise<TwentyResponse<T>> {
    const method = options.method ?? 'GET';
    const queryString = buildQueryString(options.query);
    const url = `${buildUrl(this.config, options.path)}${queryString}`;
    const hasBody = options.body !== undefined && method !== 'GET';

    const response = await fetch(url, {
      method,
      headers: buildAuthHeaders(
        this.config,
        hasBody
          ? { 'Content-Type': 'application/json', ...options.headers }
          : options.headers,
      ),
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const data = isJson
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new TwentyApiError(
        `Twenty API ${method} ${options.path} failed with HTTP ${response.status}`,
        response.status,
        data,
      );
    }

    return {
      status: response.status,
      data: data as T,
      headers: response.headers,
    };
  }

  // --- Core REST ---

  restCore = {
    list: <T = unknown>(
      objectPlural: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}`,
        query,
      }),

    get: <T = unknown>(
      objectPlural: string,
      id: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/${id}`,
        query,
      }),

    create: <T = unknown>(
      objectPlural: string,
      body: Record<string, unknown>,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'POST',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}`,
        body,
        query,
      }),

    createMany: <T = unknown>(
      objectPlural: string,
      records: Record<string, unknown>[],
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'POST',
        path: `${TWENTY_ENDPOINTS.restCore}/batch/${objectPlural}`,
        body: records,
        query,
      }),

    update: <T = unknown>(
      objectPlural: string,
      id: string,
      body: Record<string, unknown>,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'PATCH',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/${id}`,
        body,
        query,
      }),

    updateMany: <T = unknown>(
      objectPlural: string,
      body: Record<string, unknown>,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'PATCH',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}`,
        body,
        query,
      }),

    delete: <T = unknown>(
      objectPlural: string,
      id: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'DELETE',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/${id}`,
        query,
      }),

    deleteMany: <T = unknown>(
      objectPlural: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'DELETE',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}`,
        query,
      }),

    restore: <T = unknown>(objectPlural: string, id: string) =>
      this.request<T>({
        method: 'PATCH',
        path: `${TWENTY_ENDPOINTS.restCore}/restore/${objectPlural}/${id}`,
      }),

    restoreMany: <T = unknown>(
      objectPlural: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'PATCH',
        path: `${TWENTY_ENDPOINTS.restCore}/restore/${objectPlural}`,
        query,
      }),

    groupBy: <T = unknown>(
      objectPlural: string,
      query: Record<string, string | number | boolean | undefined>,
    ) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/groupBy`,
        query,
      }),

    findDuplicates: <T = unknown>(
      objectPlural: string,
      body: Record<string, unknown>,
    ) =>
      this.request<T>({
        method: 'POST',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/duplicates`,
        body,
      }),

    merge: <T = unknown>(objectPlural: string, body: Record<string, unknown>) =>
      this.request<T>({
        method: 'PATCH',
        path: `${TWENTY_ENDPOINTS.restCore}/${objectPlural}/merge`,
        body,
      }),
  };

  // --- Metadata REST ---

  restMetadata = {
    list: <T = unknown>(
      resource: string,
      query?: TwentyRequestOptions['query'],
    ) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restMetadata}/${resource}`,
        query,
      }),

    listObjects: <T = unknown>(query?: TwentyRequestOptions['query']) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restMetadata}/objects`,
        query,
      }),

    listFields: <T = unknown>(query?: TwentyRequestOptions['query']) =>
      this.request<T>({
        method: 'GET',
        path: `${TWENTY_ENDPOINTS.restMetadata}/fields`,
        query,
      }),
  };

  // --- GraphQL ---

  graphql = {
    core: <T = unknown>(query: string, variables?: Record<string, unknown>) =>
      this.request<T>({
        method: 'POST',
        path: TWENTY_ENDPOINTS.graphqlCore,
        body: { query, variables },
      }),

    metadata: <T = unknown>(
      query: string,
      variables?: Record<string, unknown>,
    ) =>
      this.request<T>({
        method: 'POST',
        path: TWENTY_ENDPOINTS.graphqlMetadata,
        body: { query, variables },
      }),
  };

  // --- Health / auth check ---

  async verifyConnection(): Promise<{
    id: string;
    displayName: string;
  }> {
    const response = await this.graphql.metadata<{
      data?: {
        currentWorkspace?: { id: string; displayName: string };
      };
      errors?: Array<{ message: string }>;
    }>(`query CurrentWorkspace {
      currentWorkspace { id displayName }
    }`);

    const workspace = response.data.data?.currentWorkspace;

    if (!workspace) {
      const errorMessage =
        response.data.errors?.map((error) => error.message).join('; ') ??
        'Unknown error';

      throw new TwentyApiError(
        `Failed to verify Twenty connection: ${errorMessage}`,
        response.status,
        response.data,
      );
    }

    return workspace;
  }
}

export const createTwentyClient = (config: TwentyConfig): TwentyClient =>
  new TwentyClient(config);
