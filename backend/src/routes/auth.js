'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const v = require('../validate');
const { sign } = require('../middleware/auth');

const r = express.Router();
const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const handle = (fn) => (req, res, next) => fn(req, res).catch(next);

r.post('/register', strict, handle(async (req, res) => {
  const email = v.email(req.body?.email);
  const password = v.str(req.body?.password, 'password', { min: 10, max: 128 });
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await db.query('INSERT INTO users(email, password_hash) VALUES ($1,$2) RETURNING id, email', [email, hash]);
    res.status(201).json({ user: rows[0], token: sign(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'E-Mail bereits registriert' });
    throw e;
  }
}));

r.post('/login', strict, handle(async (req, res) => {
  const email = v.email(req.body?.email);
  const password = v.str(req.body?.password, 'password', { max: 128 });
  const { rows } = await db.query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
  const ok = rows[0] && (await bcrypt.compare(password, rows[0].password_hash));
  if (!ok) return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
  res.json({ user: { id: rows[0].id, email: rows[0].email }, token: sign(rows[0]) });
}));

module.exports = r;
