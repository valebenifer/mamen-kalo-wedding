import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ---- .env mínimo (sin dependencias) ----
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const PROD = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3001;
const USERS = ['mamen', 'kalo', 'wedding'];

const credentials = {};
for (const u of USERS) {
  const pw = process.env[`ADMIN_${u.toUpperCase()}_PASSWORD`];
  if (pw) credentials[u] = pw;
  else if (!PROD) {
    credentials[u] = `${u}-dev`;
    console.warn(`[aviso] ADMIN_${u.toUpperCase()}_PASSWORD no definida. Usuario "${u}" con contraseña de desarrollo "${u}-dev"`);
  } else {
    console.error(`Falta ADMIN_${u.toUpperCase()}_PASSWORD (obligatoria en producción).`);
    process.exit(1);
  }
}
let SECRET = process.env.AUTH_SECRET;
if (!SECRET) {
  if (PROD) {
    console.error('Falta AUTH_SECRET (obligatoria en producción).');
    process.exit(1);
  }
  SECRET = 'dev-secret';
}

// ---- Almacén JSON con escritura atómica ----
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'rsvps.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
let rsvps = [];
try {
  rsvps = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch {
  rsvps = [];
}
function persist() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(rsvps, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---- Tokens firmados (HMAC) ----
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
function makeToken(user) {
  const payload = b64(JSON.stringify({ u: user, exp: Date.now() + 12 * 3600 * 1000 }));
  return `${payload}.${sign(payload)}`;
}
function readToken(token = '') {
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return d.exp > Date.now() ? d : null;
  } catch {
    return null;
  }
}
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function requireAdmin(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '') || req.query.token;
  const d = readToken(t);
  if (!d) return res.status(401).json({ error: 'unauthorized' });
  req.admin = d.u;
  next();
}

// ---- Límite de intentos simple en memoria ----
const hits = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

// ---- Validación ----
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
function validate(body) {
  const contactName = str(body.contactName, 100);
  const email = str(body.email, 150);
  const phone = str(body.phone, 40);
  const comment = str(body.comment, 1500);
  if (!contactName) return { error: 'contactName' };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'email' };
  if (!Array.isArray(body.guests) || body.guests.length < 1 || body.guests.length > 15) return { error: 'guests' };
  const guests = [];
  for (const g of body.guests) {
    const name = str(g?.name, 100);
    if (!name) return { error: 'guestName' };
    const attending = g.attending !== false;
    guests.push({
      name,
      type: g.type === 'child' ? 'child' : 'adult',
      attending,
      diet: ['none', 'vegetarian', 'vegan'].includes(g.diet) ? g.diet : 'none',
      intolerances: str(g.intolerances, 300),
      bus: attending && ['both', 'going', 'return', 'none'].includes(g.bus) ? g.bus : 'none',
    });
  }
  return { value: { contactName, email, phone, comment, guests } };
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));

app.post('/api/rsvp', (req, res) => {
  if (req.body?.website) return res.json({ ok: true }); // honeypot anti-spam
  if (rateLimit(`rsvp:${req.ip}`, 20, 3600_000)) return res.status(429).json({ error: 'rate' });
  const { value, error } = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  rsvps.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...value });
  persist();
  res.status(201).json({ ok: true });
});

app.post('/api/admin/login', (req, res) => {
  if (rateLimit(`login:${req.ip}`, 10, 15 * 60_000)) return res.status(429).json({ error: 'rate' });
  const username = str(req.body?.username, 30).toLowerCase();
  const password = str(req.body?.password, 200);
  const expected = Object.hasOwn(credentials, username) ? credentials[username] : undefined;
  const ok = safeEqual(password, expected ?? crypto.randomBytes(8).toString('hex')) && expected !== undefined;
  if (!ok) return res.status(401).json({ error: 'invalid' });
  res.json({ token: makeToken(username), user: username });
});

app.get('/api/admin/rsvps', requireAdmin, (_req, res) => res.json(rsvps));

app.delete('/api/admin/rsvps/:id', requireAdmin, (req, res) => {
  const before = rsvps.length;
  rsvps = rsvps.filter((r) => r.id !== req.params.id);
  if (rsvps.length === before) return res.status(404).json({ error: 'not_found' });
  persist();
  res.json({ ok: true });
});

app.get('/api/admin/export.csv', requireAdmin, (_req, res) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['fecha', 'contacto', 'email', 'telefono', 'invitado', 'tipo', 'asiste', 'dieta', 'intolerancias', 'autobus', 'comentario'];
  const rows = [head.map(esc).join(',')];
  for (const r of rsvps)
    for (const g of r.guests)
      rows.push(
        [r.createdAt, r.contactName, r.email, r.phone, g.name, g.type, g.attending ? 'si' : 'no', g.diet, g.intolerances, g.bus, r.comment]
          .map(esc)
          .join(','),
      );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="invitados.csv"');
  res.send('﻿' + rows.join('\n'));
});

// Frontend compilado
const DIST = path.join(ROOT, 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { maxAge: '7d', index: false }));
  app.use((req, res, next) => (req.method === 'GET' && !req.path.startsWith('/api') ? res.sendFile(path.join(DIST, 'index.html')) : next()));
}

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
