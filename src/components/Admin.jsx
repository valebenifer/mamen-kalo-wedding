import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/provider.jsx';
import { Icon, Logo } from './common.jsx';
import { DEMO, login, listRsvps, deleteRsvp, toCsv } from '../api.js';

export function AdminLogin({ onLogin, onClose }) {
  const { t } = useI18n();
  const a = t.admin.login;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onLogin(await login(username, password));
      return;
    } catch (err) {
      setError(err.code === 'rate' ? a.rate : err.code === 'invalid' ? a.error : a.serverError);
    }
    setBusy(false);
  }

  return (
    <main className="login-wrap">
      <form className="login card" onSubmit={submit}>
        <Logo size={56} />
        <h1>{a.title}</h1>
        <label className="field">
          <span>{a.username}</span>
          <input autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label className="field">
          <span>{a.password}</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          <Icon name="lock" size={16} /> {a.submit}
        </button>
        <button type="button" className="link-btn" onClick={onClose}>
          {t.admin.back}
        </button>
        {DEMO && <p className="muted small">Modo demo (Firebase sin configurar): usuario mamen · contraseña mamen-demo</p>}
      </form>
    </main>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone || ''}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Bars({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="panel bars">
      <h3>{title}</h3>
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span>{r.label}</span>
          <div className="bar">
            <i style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <b>{r.value}</b>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard({ user, onLogout, onClose }) {
  const { t } = useI18n();
  const a = t.admin;
  const r = t.rsvp;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  // Si la sesión caduca o no tiene permiso, vuelve al login
  const guard = useCallback(
    (err) => {
      if (err.code === 'unauthorized' || err.code === 'forbidden') onLogout();
      else setError(a.loadError);
    },
    [onLogout, a.loadError],
  );

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await listRsvps());
    } catch (e) {
      guard(e);
    }
  }, [guard]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () => (data || []).flatMap((rec) => rec.guests.map((g, i) => ({ ...g, rec, id: `${rec.id}-${i}` }))).sort((x, y) => y.rec.createdAt.localeCompare(x.rec.createdAt)),
    [data],
  );

  const s = useMemo(() => {
    const yes = rows.filter((g) => g.attending);
    const c = (fn) => yes.filter(fn).length;
    return {
      responses: (data || []).length,
      confirmed: yes.length,
      declined: rows.length - yes.length,
      adults: c((g) => g.type === 'adult'),
      children: c((g) => g.type === 'child'),
      veg: c((g) => g.diet === 'vegetarian'),
      vegan: c((g) => g.diet === 'vegan'),
      none: c((g) => g.diet === 'none'),
      intol: c((g) => g.intolerances),
      both: c((g) => g.bus === 'both'),
      going: c((g) => g.bus === 'going'),
      ret: c((g) => g.bus === 'return'),
      busNone: c((g) => g.bus === 'none'),
    };
  }, [rows, data]);

  const shown = rows.filter((g) => {
    if (filter === 'yes' && !g.attending) return false;
    if (filter === 'no' && g.attending) return false;
    const needle = q.trim().toLowerCase();
    return !needle || g.name.toLowerCase().includes(needle) || g.rec.contactName.toLowerCase().includes(needle);
  });

  const labels = {
    diet: { none: r.dietNone, vegetarian: r.dietVeg, vegan: r.dietVegan },
    bus: { both: r.busBoth, going: r.busGoing, return: r.busReturn, none: r.busNone },
    type: { adult: r.adult, child: r.child },
  };
  const fmt = (iso) => new Intl.DateTimeFormat(t.meta.locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));

  async function exportCsv() {
    const url = URL.createObjectURL(new Blob([toCsv(data || [])], { type: 'text/csv;charset=utf-8' }));
    const el = Object.assign(document.createElement('a'), { href: url, download: 'invitados.csv' });
    el.click();
    URL.revokeObjectURL(url);
  }

  async function remove(rec) {
    if (!window.confirm(a.table.confirmDelete)) return;
    try {
      await deleteRsvp(rec.id);
      load();
    } catch (e) {
      guard(e);
    }
  }

  return (
    <main className="admin">
      <header className="admin-bar">
        <div className="admin-title">
          <Logo size={34} />
          <div>
            <h1>{a.title}</h1>
            <p className="muted small">
              {a.hello}, <b style={{ textTransform: 'capitalize' }}>{user}</b>
            </p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="btn btn-outline sm" onClick={load}>
            <Icon name="refresh" size={16} /> {a.refresh}
          </button>
          <button className="btn btn-outline sm" onClick={exportCsv} disabled={!rows.length}>
            <Icon name="download" size={16} /> {a.export}
          </button>
          <button className="btn btn-outline sm" onClick={onClose}>
            {a.back}
          </button>
          <button className="btn btn-primary sm" onClick={() => onLogout()}>
            {a.logout}
          </button>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <div className="stats">
        <Stat label={a.stats.responses} value={s.responses} />
        <Stat label={a.stats.confirmed} value={s.confirmed} tone="good" />
        <Stat label={a.stats.declined} value={s.declined} tone="bad" />
        <Stat label={a.stats.adults} value={s.adults} />
        <Stat label={a.stats.children} value={s.children} />
        <Stat label={a.stats.vegetarian} value={s.veg} />
        <Stat label={a.stats.vegan} value={s.vegan} />
        <Stat label={a.stats.intolerances} value={s.intol} />
        <Stat label={a.stats.busOut} value={s.both + s.going} tone="accent" />
        <Stat label={a.stats.busBack} value={s.both + s.ret} tone="accent" />
      </div>

      <div className="charts">
        <Bars title={a.stats.busBreakdown} rows={[{ label: r.busBoth, value: s.both }, { label: r.busGoing, value: s.going }, { label: r.busReturn, value: s.ret }, { label: r.busNone, value: s.busNone }]} />
        <Bars title={a.stats.dietBreakdown} rows={[{ label: r.dietNone, value: s.none }, { label: r.dietVeg, value: s.veg }, { label: r.dietVegan, value: s.vegan }]} />
        <Bars title={a.stats.typeBreakdown} rows={[{ label: r.adult, value: s.adults }, { label: r.child, value: s.children }]} />
      </div>

      <section className="panel">
        <div className="table-tools">
          <h2>{a.table.title}</h2>
          <input type="search" placeholder={a.table.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="seg">
            {[['all', a.table.all], ['yes', a.table.confirmedOnly], ['no', a.table.declinedOnly]].map(([v, l]) => (
              <label key={v} className={filter === v ? 'on' : ''}>
                <input type="radio" name="flt" checked={filter === v} onChange={() => setFilter(v)} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{a.table.name}</th>
                <th>{a.table.status}</th>
                <th>{a.table.type}</th>
                <th>{a.table.diet}</th>
                <th>{a.table.intolerances}</th>
                <th>{a.table.bus}</th>
                <th>{a.table.contact}</th>
                <th>{a.table.comment}</th>
                <th>{a.table.date}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.id} className={g.attending ? '' : 'declined'}>
                  <td data-label={a.table.name}><b>{g.name}</b></td>
                  <td data-label={a.table.status}>
                    <span className={`tag ${g.attending ? 'good' : 'bad'}`}>{g.attending ? a.table.confirmedTag : a.table.declinedTag}</span>
                  </td>
                  <td data-label={a.table.type}>{labels.type[g.type]}</td>
                  <td data-label={a.table.diet}>{g.attending ? labels.diet[g.diet] : '—'}</td>
                  <td data-label={a.table.intolerances}>{g.intolerances || '—'}</td>
                  <td data-label={a.table.bus}>{g.attending ? labels.bus[g.bus] : '—'}</td>
                  <td data-label={a.table.contact}>
                    {g.rec.contactName}
                    {g.rec.email && <small><br />{g.rec.email}</small>}
                    {g.rec.phone && <small><br />{g.rec.phone}</small>}
                  </td>
                  <td data-label={a.table.comment} className="comment-cell">{g.rec.comment || '—'}</td>
                  <td data-label={a.table.date}>{fmt(g.rec.createdAt)}</td>
                  <td>
                    <button className="icon-btn" title={a.table.delete} aria-label={a.table.delete} onClick={() => remove(g.rec)}>
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && !shown.length && <p className="empty">{rows.length ? a.table.noResults : a.table.empty}</p>}
        </div>
      </section>
    </main>
  );
}
