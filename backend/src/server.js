'use strict';
const http = require('http');
const { config, validate } = require('./config');
const log = require('./logger');
const { createApp } = require('./app');
const { attachWebSocket } = require('./ws');
const { migrate } = require('./db/migrate');
const db = require('./db');

async function main() {
  const errors = validate();
  if (errors.length) { errors.forEach((e) => log.error(e)); process.exit(1); }
  await migrate();
  const server = http.createServer(createApp());
  attachWebSocket(server, config.corsOrigins);
  server.listen(config.port, () => log.info('listening', { port: config.port }));
  const stop = () => server.close(() => db.getPool().end().then(() => process.exit(0)));
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

main().catch((e) => { log.error('startup failed', { error: e.message }); process.exit(1); });
