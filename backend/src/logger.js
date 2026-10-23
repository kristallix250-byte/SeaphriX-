'use strict';
const { config } = require('./config');
const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function log(level, msg, meta) {
  if ((levels[level] ?? 2) > (levels[config.logLevel] ?? 2)) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...meta });
  (level === 'error' ? console.error : console.log)(line);
}

module.exports = {
  error: (m, x) => log('error', m, x),
  warn: (m, x) => log('warn', m, x),
  info: (m, x) => log('info', m, x),
  debug: (m, x) => log('debug', m, x),
};
