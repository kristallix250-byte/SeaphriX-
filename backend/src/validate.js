'use strict';

class ValidationError extends Error {
  constructor(message) { super(message); this.status = 400; }
}

// Entfernt Steuerzeichen (außer \n, \t) und trimmt.
const clean = (s) => String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

function str(v, name, { min = 1, max = 255 } = {}) {
  if (typeof v !== 'string') throw new ValidationError(`${name} muss ein String sein`);
  const s = clean(v);
  if (s.length < min || s.length > max) throw new ValidationError(`${name}: Länge ${min}-${max} erforderlich`);
  return s;
}

function email(v) {
  const s = str(v, 'email', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new ValidationError('email ungültig');
  return s;
}

module.exports = { ValidationError, str, email, clean };
