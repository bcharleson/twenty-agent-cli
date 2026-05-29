# Contributing

Thanks for helping improve **twenty-agent-cli**.

## Development setup

```bash
git clone https://github.com/bcharleson/twenty-agent-cli.git
cd twenty-agent-cli
npm install
cp .env.example .env
# Add TWENTY_BASE_URL and TWENTY_API_KEY
npm run build
npm link   # optional — install `twenty-agent` globally
twenty-agent ping
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type check without emit |
| `npm run dev -- ping` | Run CLI via tsx (no build) |
| `npm run dev:serve` | Run stdio MCP server via tsx |

## Project layout

```
src/
├── cli/          # Commander CLI entry + command modules
├── agent/        # Stdio MCP server + tool definitions
├── core/         # HTTP client, config, /mcp protocol client
├── operations/   # Shared logic used by CLI and MCP
└── shared/       # Query param helpers, JSON utilities
```

## Pull requests

1. Fork and create a feature branch from `main`.
2. Keep changes focused — one concern per PR.
3. Run `npm run typecheck` and `npm run build` before opening.
4. Update [docs/COMMAND-REFERENCE.md](./docs/COMMAND-REFERENCE.md) when adding CLI commands or MCP tools.
5. Describe how you tested against a real Twenty instance (cloud or self-hosted).

## Reporting issues

Include:

- Twenty deployment type (cloud vs self-hosted) and version if known
- `twenty-agent ping` output (redact API keys)
- Full command or MCP tool call that failed
- Error response body when available

## Scope

This package **operates** Twenty CRM instances (REST, GraphQL, `/mcp` bridge). It is not the official Twenty app builder — see [twenty-sdk](https://www.npmjs.com/package/twenty-sdk) for that.
