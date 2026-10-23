'use strict';
const { config } = require('../config');
const { postJson } = require('./http');
const log = require('../logger');

const strip = (u) => u.replace(/\/+$/, '');

// Jeder Provider: configured() und chat(messages) -> { text, model }
// messages: [{ role: 'user'|'assistant'|'system', content }]
function openAiCompatible(name, cfg, baseUrl) {
  return {
    name,
    configured: () => Boolean(cfg.apiKey && baseUrl),
    async chat(messages) {
      const d = await postJson(`${strip(baseUrl)}/chat/completions`, { model: cfg.model, messages },
        { authorization: `Bearer ${cfg.apiKey}` });
      return { text: d.choices[0].message.content, model: cfg.model };
    },
  };
}

const factories = {
  openai: () => openAiCompatible('openai', config.ai.openai, 'https://api.openai.com/v1'),
  meta: () => openAiCompatible('meta', config.ai.meta, config.ai.meta.baseUrl || ''),
  anthropic: () => ({
    name: 'anthropic',
    configured: () => Boolean(config.ai.anthropic.apiKey),
    async chat(messages) {
      const c = config.ai.anthropic;
      const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
      const d = await postJson('https://api.anthropic.com/v1/messages', {
        model: c.model, max_tokens: 1024, ...(system && { system }),
        messages: messages.filter((m) => m.role !== 'system'),
      }, { 'x-api-key': c.apiKey, 'anthropic-version': '2023-06-01' });
      return { text: d.content.map((p) => p.text || '').join(''), model: c.model };
    },
  }),
  gemini: () => ({
    name: 'gemini',
    configured: () => Boolean(config.ai.gemini.apiKey),
    async chat(messages) {
      const c = config.ai.gemini;
      const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
      const d = await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(c.model)}:generateContent`,
        {
          ...(system && { systemInstruction: { parts: [{ text: system }] } }),
          contents: messages.filter((m) => m.role !== 'system').map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }],
          })),
        }, { 'x-goog-api-key': c.apiKey });
      return { text: d.candidates[0].content.parts.map((p) => p.text || '').join(''), model: c.model };
    },
  }),
  ollama: () => ({
    name: 'ollama',
    configured: () => Boolean(config.ai.ollama.baseUrl),
    async chat(messages) {
      const c = config.ai.ollama;
      const d = await postJson(`${strip(c.baseUrl)}/api/chat`, { model: c.model, messages, stream: false });
      return { text: d.message.content, model: c.model };
    },
  }),
};

function available(preferred) {
  const order = preferred ? [preferred] : config.ai.order;
  return order.filter((n) => Object.hasOwn(factories, n)).map((n) => factories[n]()).filter((p) => p.configured());
}

// Versucht Provider der Reihe nach (Fallback bei Fehlern).
async function chatWithFallback(messages, preferred) {
  const providers = available(preferred);
  if (!providers.length) {
    const e = new Error('Kein KI-Provider konfiguriert'); e.status = 503; throw e;
  }
  const failures = [];
  for (const p of providers) {
    try {
      const r = await p.chat(messages);
      return { ...r, provider: p.name, failures };
    } catch (err) {
      log.warn('provider failed', { provider: p.name, error: err.message });
      failures.push({ provider: p.name, error: err.message });
    }
  }
  const e = new Error('Alle KI-Provider fehlgeschlagen'); e.status = 502; e.failures = failures; throw e;
}

module.exports = { chatWithFallback, available, names: Object.keys(factories) };
