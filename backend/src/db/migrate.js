'use strict';
const { getPool } = require('./index');
const migrations = require('./migrations.sql.js');
const log = require('../logger');

async function migrate() {
  const client = await getPool().connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    // Advisory lock: verhindert parallele Migrationen
    await client.query('SELECT pg_advisory_lock(727274)');
    const done = new Set((await client.query('SELECT id FROM schema_migrations')).rows.map((r) => r.id));
    for (const m of migrations) {
      if (done.has(m.id)) continue;
      await client.query('BEGIN');
      try {
        await client.query(m.sql);
        await client.query('INSERT INTO schema_migrations(id) VALUES ($1)', [m.id]);
        await client.query('COMMIT');
        log.info('migration applied', { id: m.id });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }
    await client.query('SELECT pg_advisory_unlock(727274)');
  } finally {
    client.release();
  }
}

module.exports = { migrate };

if (require.main === module) {
  migrate().then(() => getPool().end()).catch((e) => { console.error(e); process.exit(1); });
}
