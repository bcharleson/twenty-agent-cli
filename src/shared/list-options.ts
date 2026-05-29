import type { Command } from 'commander';

export const addListQueryOptions = (command: Command): Command =>
  command
    .option('--limit <n>', 'Page size')
    .option('--filter <expr>', 'Filter expression, e.g. city[eq]:Paris')
    .option('--order-by <expr>', 'Sort, e.g. createdAt[DescNullsLast]')
    .option('--depth <n>', 'Relation depth (0-2)')
    .option('--starting-after <cursor>', 'Forward pagination cursor')
    .option('--ending-before <cursor>', 'Backward pagination cursor')
    .option('--view-id <uuid>', 'Apply a saved view filter/sort')
    .option('--omit-null-values', 'Omit null fields from response');

export const addUpsertOption = (command: Command): Command =>
  command.option(
    '--upsert',
    'Create-or-update on unique fields (POST ?upsert=true)',
  );

export const addBulkFilterOptions = (command: Command): Command =>
  command
    .requiredOption('--filter <expr>', 'Filter for bulk operation (required)')
    .option('--depth <n>', 'Relation depth (0-2)');

export const addSoftDeleteOption = (command: Command): Command =>
  command.option(
    '--soft-delete',
    'Soft-delete instead of hard delete (DELETE ?soft_delete=true)',
  );

export const addGroupByOptions = (command: Command): Command =>
  addListQueryOptions(command)
    .option(
      '--group-by <json>',
      'Group-by dimensions JSON array, e.g. \'[{"city": true}]\'',
    )
    .option(
      '--aggregate <json>',
      'Aggregate fields JSON array, e.g. \'["countNotEmptyId"]\'',
    )
    .option(
      '--include-records-sample',
      'Include sample records per group (groupBy only)',
    );

export const addMetadataListOptions = (command: Command): Command =>
  command
    .option('--limit <n>', 'Page size')
    .option('--starting-after <cursor>', 'Forward pagination cursor')
    .option('--ending-before <cursor>', 'Backward pagination cursor');
