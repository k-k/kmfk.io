import config from './config.js';
import { createApp } from './app.js';

const server = createApp(config).listen(config.port, () => {
  console.log(`kmfk.io listening on port ${config.port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
