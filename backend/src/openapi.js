'use strict';
const sec = [{ bearerAuth: [] }];
const json = (schema) => ({ content: { 'application/json': { schema } } });
module.exports = {
  openapi: '3.0.3',
  info: { title: 'SÆPHRIX-X API', version: '1.0.0', description: 'Multi-KI-Startzentrale. WebSocket: /ws (Subprotokoll "bearer, <JWT>"), Nachricht {prompt, provider?, projectId?}.' },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/health': { get: { summary: 'Health-Check', responses: { 200: { description: 'ok' }, 503: { description: 'DB nicht erreichbar' } } } },
    '/api/auth/register': { post: { summary: 'Registrieren', requestBody: json({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string', minLength: 10 } } }), responses: { 201: { description: 'Nutzer + JWT' }, 409: { description: 'E-Mail existiert' } } } },
    '/api/auth/login': { post: { summary: 'Login', requestBody: json({ type: 'object', required: ['email', 'password'] }), responses: { 200: { description: 'Nutzer + JWT' }, 401: { description: 'Ungültig' } } } },
    '/api/projects': {
      get: { summary: 'Projekte auflisten', security: sec, responses: { 200: { description: 'Liste' } } },
      post: { summary: 'Projekt anlegen', security: sec, requestBody: json({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } }), responses: { 201: { description: 'Projekt' } } },
    },
    '/api/projects/{id}': { delete: { summary: 'Projekt löschen', security: sec, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { 204: { description: 'Gelöscht' }, 404: { description: 'Nicht gefunden' } } } },
    '/api/ai/providers': { get: { summary: 'Konfigurierte KI-Provider', security: sec, responses: { 200: { description: 'Namen' } } } },
    '/api/ai/chat': { post: { summary: 'KI-Anfrage mit automatischem Fallback', security: sec, requestBody: json({ type: 'object', required: ['prompt'], properties: { prompt: { type: 'string' }, provider: { type: 'string', enum: ['openai', 'anthropic', 'gemini', 'meta', 'ollama'] }, projectId: { type: 'string', format: 'uuid' } } }), responses: { 200: { description: 'Antwort' }, 502: { description: 'Alle Provider fehlgeschlagen' }, 503: { description: 'Kein Provider konfiguriert' } } } },
    '/api/ai/history': { get: { summary: 'Letzte 50 Antworten (entschlüsselt)', security: sec, responses: { 200: { description: 'Liste' } } } },
  },
};
