'use strict';
const db = require('./db');
const v = require('./validate');
const { config } = require('./config');
const { chatWithFallback, names } = require('./providers');
const { encrypt } = require('./crypto');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validiert Eingabe, ruft KI mit Fallback auf, speichert verschlüsselt.
async function runChat(userId, input) {
  const prompt = v.str(input?.prompt, 'prompt', { max: config.maxPromptChars });
  let provider;
  if (input.provider != null) {
    provider = v.str(input.provider, 'provider', { max: 20 });
    if (!names.includes(provider)) throw new v.ValidationError('provider unbekannt');
  }
  let projectId = null;
  if (input.projectId != null) {
    if (typeof input.projectId !== 'string' || !UUID.test(input.projectId)) throw new v.ValidationError('projectId ungültig');
    const own = await db.query('SELECT 1 FROM projects WHERE id=$1 AND user_id=$2', [input.projectId, userId]);
    if (!own.rowCount) throw new v.ValidationError('Projekt nicht gefunden');
    projectId = input.projectId;
  }
  const messages = [
    { role: 'system', content: 'Du bist SÆPHRIX-X, eine KI-Startzentrale, die Nutzer zielgeführt durch Programmier- und Systemprojekte leitet.' },
    { role: 'user', content: prompt },
  ];
  const result = await chatWithFallback(messages, provider);
  await db.query(
    'INSERT INTO ai_responses(user_id, project_id, provider, model, prompt_enc, response_enc) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, projectId, result.provider, result.model, encrypt(prompt, config.encryptionKey), encrypt(result.text, config.encryptionKey)],
  );
  return { text: result.text, provider: result.provider, model: result.model, fallbacks: result.failures };
}

module.exports = { runChat };
