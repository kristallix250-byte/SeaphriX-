'use strict';
process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:1';
process.env.OPENAI_API_KEY = 'x';
const test = require('node:test');
const assert = require('node:assert');
const { encrypt, decrypt } = require('../src/crypto');
const v = require('../src/validate');
const { validate } = require('../src/config');

const K = 'k'.repeat(32);

test('encrypt/decrypt roundtrip', () => {
  const c = encrypt('Hallo Wörld', K);
  assert.notStrictEqual(c, 'Hallo Wörld');
  assert.strictEqual(decrypt(c, K), 'Hallo Wörld');
  assert.throws(() => decrypt(c, 'x'.repeat(32)));
});

test('validation', () => {
  assert.strictEqual(v.email(' A@B.de '), 'a@b.de');
  assert.throws(() => v.email('nope'), v.ValidationError);
  assert.strictEqual(v.str('a\u0000b', 'x'), 'ab');
  assert.throws(() => v.str(5, 'x'));
});

test('config validation', () => {
  assert.strictEqual(validate({ jwtSecret: K, encryptionKey: K, databaseUrl: 'x' }).length, 0);
  assert.strictEqual(validate({}).length, 3);
});

test('provider fallback', async () => {
  const { chatWithFallback } = require('../src/providers');
  const real = global.fetch;
  global.fetch = async (url) => {
    if (String(url).includes('openai')) return { ok: true, json: async () => ({ choices: [{ message: { content: 'hi' } }] }) };
    throw new Error('down');
  };
  const r = await chatWithFallback([{ role: 'user', content: 'x' }]);
  global.fetch = real;
  assert.strictEqual(r.provider, 'openai');
  assert.strictEqual(r.failures[0].provider, 'ollama');
});
