'use strict';
const jwt = require('jsonwebtoken');
const { config } = require('../config');

const sign = (user) => jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '12h', algorithm: 'HS256' });
const verify = (token) => jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

function requireAuth(req, res, next) {
  const m = /^Bearer (.+)$/i.exec(req.headers.authorization || '');
  if (!m) return res.status(401).json({ error: 'Nicht authentifiziert' });
  try {
    req.userId = verify(m[1]).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig' });
  }
}

module.exports = { sign, verify, requireAuth };
