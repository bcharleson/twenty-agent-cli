import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const configSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  workspaceSubdomain: z.string().optional(),
});

export type TwentyConfig = z.infer<typeof configSchema>;

let cachedConfig: TwentyConfig | null = null;

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

export const loadConfig = (overrides?: Partial<TwentyConfig>): TwentyConfig => {
  if (cachedConfig && !overrides) {
    return cachedConfig;
  }

  loadDotenv();

  const raw = {
    baseUrl:
      overrides?.baseUrl ??
      process.env.TWENTY_BASE_URL ??
      process.env.TWENTY_API_URL,
    apiKey: overrides?.apiKey ?? process.env.TWENTY_API_KEY,
    workspaceSubdomain:
      overrides?.workspaceSubdomain ??
      process.env.TWENTY_WORKSPACE_SUBDOMAIN,
  };

  const parsed = configSchema.safeParse({
    ...raw,
    baseUrl: raw.baseUrl ? normalizeBaseUrl(raw.baseUrl) : undefined,
  });

  if (!parsed.success) {
    const missing: string[] = [];

    if (!raw.baseUrl) {
      missing.push('TWENTY_BASE_URL (or --base-url)');
    }

    if (!raw.apiKey) {
      missing.push('TWENTY_API_KEY (or --api-key)');
    }

    throw new Error(
      `Twenty configuration incomplete. Set: ${missing.join(', ')}`,
    );
  }

  cachedConfig = parsed.data;

  return parsed.data;
};

export const resetConfigCache = (): void => {
  cachedConfig = null;
};

export const buildUrl = (
  config: TwentyConfig,
  path: string,
): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${config.baseUrl}${normalizedPath}`;
};

export const buildAuthHeaders = (
  config: TwentyConfig,
  extraHeaders?: Record<string, string>,
): Record<string, string> => ({
  Authorization: `Bearer ${config.apiKey}`,
  Accept: 'application/json',
  ...extraHeaders,
});
