'use strict';
const express = require('express');
const db = require('../db');
const { config } = require('../config');
const { decrypt } = require('../crypto');
const { runChat } = require('../chat');
const { available } = require('../providers');

const r = express.Router();
const handle = (fn) => (req, res, next) => fn(req, res).catch(next);

r.get('/providers', (req, res) => res.json(available().map((p) => p.name)));

r.post('/chat', handle(async (req, res) => {
  res.json(await runChat(req.userId, req.body));
}));

r.get('/history', handle(async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, project_id, provider, model, prompt_enc, response_enc, created_at FROM ai_responses WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [req.userId]);
  res.json(rows.map((x) => ({
    id: x.id, projectId: x.project_id, provider: x.provider, model: x.model, createdAt: x.created_at,
    prompt: decrypt(x.prompt_enc, config.encryptionKey), response: decrypt(x.response_enc, config.encryptionKey),
  })));
}));

module.exports = r;
