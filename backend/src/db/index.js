'use strict';
const { Pool } = require('pg');
const { config } = require('../config');

let pool;
const getPool = () => (pool ||= new Pool({ connectionString: config.databaseUrl, max: 10 }));

module.exports = { query: (t, p) => getPool().query(t, p), getPool };
