'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { config } = require('./config');
const log = require('./logger');
const db = require('./db');
const { requireAuth } = require('./middleware/auth');
const openapi = require('./openapi');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'DELETE'] }));
  app.use(express.json({ limit: '64kb' }));
  app.use(rateLimit({ windowMs: 60 * 1000, limit: config.rateLimitPerMin, standardHeaders: true, legacyHeaders: false }));
  app.use((req, res, next) => {
    res.on('finish', () => log.info('request', { method: req.method, path: req.path, status: res.statusCode }));
    next();
  });

  app.get('/health', async (req, res) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ok' }); }
    catch { res.status(503).json({ status: 'db_unavailable' }); }
  });
  app.get('/api/openapi.json', (req, res) => res.json(openapi));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/projects', requireAuth, require('./routes/projects'));
  app.use('/api/ai', requireAuth, require('./routes/ai'));

  app.use((req, res) => res.status(404).json({ error: 'Nicht gefunden' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Ungültiges JSON' });
    const status = err.status && err.status < 600 ? err.status : 500;
    if (status >= 500) log.error('unhandled', { error: err.message });
    res.status(status).json({ error: status >= 500 && status !== 502 && status !== 503 ? 'Interner Fehler' : err.message });
  });
  return app;
}

module.exports = { createApp };
