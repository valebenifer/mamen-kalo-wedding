import { FIREBASE, ADMIN_EMAIL_DOMAIN } from './firebaseConfig.js';

export const DEMO = !FIREBASE.apiKey || !FIREBASE.projectId;

const KEY = FIREBASE.apiKey;
const FS = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
const SESSION_KEY = 'adminSession';
const DEMO_KEY = 'demoRsvps';

export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code; // 'invalid' | 'rate' | 'forbidden' | 'network' | 'server' | 'unauthorized'
    this.status = status;
  }
}

// ---------- Conversión JS <-> formato de valores de Firestore ----------
function toValue(v) {
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return { integerValue: String(v) };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: toFields(v) } };
}
const toFields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toValue(v)]));
function fromValue(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  return null;
}
const fromFields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, fromValue(v)]));

async function call(url, opts) {
  let res;
  try {
    res = await fetch(url, opts);
  } catch {
    throw new ApiError('network', 0);
  }
  if (res.ok) return res;
  if (res.status === 401) throw new ApiError('unauthorized', 401);
  if (res.status === 403) throw new ApiError('forbidden', 403);
  if (res.status === 429) throw new ApiError('rate', 429);
  throw new ApiError('server', res.status);
}

// ---------- Envío de respuestas (público) ----------
export async function submitRsvp(data) {
  const rec = { createdAt: new Date().toISOString(), ...data };
  if (DEMO) {
    const all = JSON.parse(localStorage.getItem(DEMO_KEY) || '[]');
    all.push({ id: crypto.randomUUID(), ...rec });
    localStorage.setItem(DEMO_KEY, JSON.stringify(all));
    return;
  }
  await call(`${FS}/rsvps?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(rec) }),
  });
}

// ---------- Sesión de administración ----------
const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};
const writeSession = (s) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));

export const currentAdmin = () => readSession()?.user || null;
export const logout = () => sessionStorage.removeItem(SESSION_KEY);

export async function login(username, password) {
  const user = username.trim().toLowerCase();
  if (DEMO) {
    if (['mamen', 'kalo', 'wedding'].includes(user) && password === `${user}-demo`) {
      writeSession({ user });
      return user;
    }
    throw new ApiError('invalid', 401);
  }
  let res;
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${user}@${ADMIN_EMAIL_DOMAIN}`, password, returnSecureToken: true }),
    });
  } catch {
    throw new ApiError('network', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || '';
    if (msg.startsWith('TOO_MANY_ATTEMPTS')) throw new ApiError('rate', 429);
    if (/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_EMAIL|USER_DISABLED/.test(msg)) throw new ApiError('invalid', 400);
    throw new ApiError('server', res.status);
  }
  writeSession({ user, idToken: data.idToken, refreshToken: data.refreshToken, exp: Date.now() + Number(data.expiresIn) * 1000 });
  return user;
}

/** Devuelve un idToken válido, renovándolo si está a punto de caducar */
async function getToken() {
  const s = readSession();
  if (!s?.idToken) throw new ApiError('unauthorized', 401);
  if (s.exp - Date.now() > 60_000) return s.idToken;
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(s.refreshToken)}`,
  }).catch(() => null);
  if (!res?.ok) {
    logout();
    throw new ApiError('unauthorized', 401);
  }
  const d = await res.json();
  writeSession({ ...s, idToken: d.id_token, refreshToken: d.refresh_token, exp: Date.now() + Number(d.expires_in) * 1000 });
  return d.id_token;
}

// ---------- Datos del panel (solo con sesión) ----------
export async function listRsvps() {
  if (DEMO) return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]');
  const token = await getToken();
  const out = [];
  let pageToken = '';
  do {
    const res = await call(`${FS}/rsvps?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    for (const d of data.documents || []) out.push({ id: d.name.split('/').pop(), ...fromFields(d.fields || {}) });
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return out;
}

export async function deleteRsvp(id) {
  if (DEMO) {
    const all = JSON.parse(localStorage.getItem(DEMO_KEY) || '[]').filter((r) => r.id !== id);
    localStorage.setItem(DEMO_KEY, JSON.stringify(all));
    return;
  }
  const token = await getToken();
  await call(`${FS}/rsvps/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

// ---------- Exportar CSV (en el navegador) ----------
export function toCsv(rsvps) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['fecha', 'contacto', 'email', 'telefono', 'invitado', 'tipo', 'asiste', 'dieta', 'intolerancias', 'autobus', 'comentario'].map(esc).join(',')];
  for (const r of rsvps)
    for (const g of r.guests)
      rows.push([r.createdAt, r.contactName, r.email, r.phone, g.name, g.type, g.attending ? 'si' : 'no', g.diet, g.intolerances, g.bus, r.comment].map(esc).join(','));
  return '﻿' + rows.join('\n');
}
