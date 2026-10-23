'use strict';
require('dotenv').config();

const int = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);
const list = (v, d) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : d);

const env = process.env;
const config = {
  env: env.NODE_ENV || 'development',
  port: int(env.PORT, 3000),
  databaseUrl: env.DATABASE_URL || '',
  jwtSecret: env.JWT_SECRET || '',
  encryptionKey: env.ENCRYPTION_KEY || '',
  corsOrigins: list(env.CORS_ORIGINS, []),
  rateLimitPerMin: int(env.RATE_LIMIT_PER_MIN, 60),
  maxPromptChars: int(env.MAX_PROMPT_CHARS, 8000),
  requestTimeoutMs: int(env.REQUEST_TIMEOUT_MS, 60000),
  logLevel: env.LOG_LEVEL || 'info',
  ai: {
    order: list(env.AI_PROVIDER_ORDER, ['ollama', 'openai', 'anthropic', 'gemini', 'meta']),
    openai: { apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL || 'gpt-4o-mini' },
    anthropic: { apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest' },
    gemini: { apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL || 'gemini-1.5-flash' },
    meta: { apiKey: env.META_API_KEY, baseUrl: env.META_BASE_URL, model: env.META_MODEL || 'llama-3.1-8b-instruct' },
    ollama: { baseUrl: env.OLLAMA_BASE_URL, model: env.OLLAMA_MODEL || 'llama3.1' },
  },
};

function validate(c = config) {
  const errors = [];
  if (!c.jwtSecret || c.jwtSecret.length < 32) errors.push('JWT_SECRET muss mindestens 32 Zeichen haben');
  if (!c.encryptionKey || c.encryptionKey.length < 32) errors.push('ENCRYPTION_KEY muss mindestens 32 Zeichen haben');
  if (!c.databaseUrl) errors.push('DATABASE_URL fehlt');
  return errors;
}

module.exports = { config, validate };
