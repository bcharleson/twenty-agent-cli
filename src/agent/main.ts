import { runAgentServer } from './server.js';

runAgentServer().catch((error) => {
  process.stderr.write(
    `twenty-agent serve failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
