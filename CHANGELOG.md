# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-05-29

### Added

- `twenty-agent` CLI with Core REST, Metadata REST, GraphQL, and workspace tool catalog commands
- Stdio MCP server via `twenty-agent serve` (24 tools)
- REST upsert flags: `--upsert` on `post` and `batch`
- Bulk operations: `patch-many`, `delete-many`, `restore-many` with `--filter`
- Soft delete: `--soft-delete` on `delete` and `delete-many`
- Extended list/group-by query flags: `--view-id`, `--omit-null-values`, `--group-by`, `--aggregate`, `--include-records-sample`
- Documentation: README, AGENTS.md, API reference, command reference, API coverage matrix
- Example MCP configs for Cursor and Claude Desktop

### Notes

- Community tool — not affiliated with Twenty HQ
- Tested against Twenty self-hosted; compatible with Twenty Cloud (`https://api.twenty.com`)

[0.1.0]: https://github.com/bcharleson/twenty-agent-cli/releases/tag/v0.1.0
