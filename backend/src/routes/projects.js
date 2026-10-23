'use strict';
const express = require('express');
const db = require('../db');
const v = require('../validate');

const r = express.Router();
const handle = (fn) => (req, res, next) => fn(req, res).catch(next);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

r.get('/', handle(async (req, res) => {
  const { rows } = await db.query('SELECT id, name, description, created_at FROM projects WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(rows);
}));

r.post('/', handle(async (req, res) => {
  const name = v.str(req.body?.name, 'name', { max: 100 });
  const description = req.body?.description == null ? '' : v.str(req.body.description, 'description', { min: 0, max: 2000 });
  const { rows } = await db.query('INSERT INTO projects(user_id, name, description) VALUES ($1,$2,$3) RETURNING id, name, description, created_at', [req.userId, name, description]);
  res.status(201).json(rows[0]);
}));

r.delete('/:id', handle(async (req, res) => {
  if (!UUID.test(req.params.id)) return res.status(400).json({ error: 'id ungültig' });
  const { rowCount } = await db.query('DELETE FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.status(rowCount ? 204 : 404).end();
}));

module.exports = r;
