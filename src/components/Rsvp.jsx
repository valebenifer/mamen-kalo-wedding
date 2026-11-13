import { useRef, useState } from 'react';
import { useI18n } from '../i18n/provider.jsx';
import { Icon, SectionHead } from './common.jsx';

let seq = 0;
const newGuest = () => ({ key: ++seq, name: '', type: 'adult', attending: true, diet: 'none', intolerances: '', bus: 'both' });

function Segmented({ value, onChange, options, name }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map(([v, label]) => (
        <label key={v} className={value === v ? 'on' : ''}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Rsvp() {
  const { t } = useI18n();
  const r = t.rsvp;
  const [contact, setContact] = useState({ contactName: '', email: '', phone: '' });
  const [guests, setGuests] = useState(() => [newGuest()]);
  const [comment, setComment] = useState('');
  const [honey, setHoney] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const setGuest = (key, patch) => setGuests((gs) => gs.map((g) => (g.key === key ? { ...g, ...patch } : g)));

  const reset = () => {
    setContact({ contactName: '', email: '', phone: '' });
    setGuests([newGuest()]);
    setComment('');
    setStatus('idle');
    setError('');
  };

  async function submit(e) {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          comment,
          website: honey,
          guests: guests.map(({ key, ...g }) => g),
        }),
      });
      if (res.ok) {
        setStatus('done');
        document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(r.errors[data.error] || (res.status === 429 ? r.errors.rate : r.errors.generic));
    } catch {
      setError(r.errors.generic);
    }
    setStatus('idle');
  }

  return (
    <section className="section" id="rsvp">
      <div className="container narrow">
        <SectionHead eyebrow={r.eyebrow} title={r.title} subtitle={r.subtitle} />

        {status === 'done' ? (
          <div className="thanks card reveal in">
            <Icon name="check" size={40} className="card-icon" />
            <h3>{r.thanksTitle}</h3>
            <p>{r.thanksText}</p>
            <button className="btn btn-outline" onClick={reset}>
              {r.another}
            </button>
          </div>
        ) : (
          <form className="rsvp-form reveal" onSubmit={submit} ref={formRef} noValidate={false}>
            <fieldset className="panel">
              <legend>{r.contact}</legend>
              <div className="grid-2">
                <label className="field">
                  <span>{r.contactName}</span>
                  <input required maxLength={100} autoComplete="name" value={contact.contactName} onChange={(e) => setContact({ ...contact, contactName: e.target.value })} />
                </label>
                <label className="field">
                  <span>
                    {r.email} <small>({r.optional})</small>
                  </span>
                  <input type="email" maxLength={150} autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </label>
                <label className="field">
                  <span>
                    {r.phone} <small>({r.optional})</small>
                  </span>
                  <input type="tel" maxLength={40} autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </label>
              </div>
            </fieldset>

            <h3 className="form-h">{r.guests}</h3>
            {guests.map((g, i) => (
              <fieldset className="panel guest" key={g.key}>
                <legend>
                  {r.guest} {i + 1}
                </legend>
                {guests.length > 1 && (
                  <button type="button" className="remove" onClick={() => setGuests((gs) => gs.filter((x) => x.key !== g.key))} aria-label={`${r.remove} ${r.guest} ${i + 1}`}>
                    <Icon name="close" size={16} /> {r.remove}
                  </button>
                )}

                <label className="field">
                  <span>{r.guestName}</span>
                  <input required maxLength={100} placeholder={i === 0 ? contact.contactName : ''} value={g.name} onChange={(e) => setGuest(g.key, { name: e.target.value })} />
                </label>

                <div className="grid-2">
                  <div className="field">
                    <span>{r.type}</span>
                    <Segmented name={`type${g.key}`} value={g.type} onChange={(v) => setGuest(g.key, { type: v })} options={[['adult', r.adult], ['child', r.child]]} />
                  </div>
                  <div className="field">
                    <span>{r.attendance}</span>
                    <Segmented name={`att${g.key}`} value={g.attending ? 'y' : 'n'} onChange={(v) => setGuest(g.key, { attending: v === 'y' })} options={[['y', r.yes], ['n', r.no]]} />
                  </div>
                </div>

                {g.attending && (
                  <>
                    <div className="field">
                      <span>{r.diet}</span>
                      <Segmented name={`diet${g.key}`} value={g.diet} onChange={(v) => setGuest(g.key, { diet: v })} options={[['none', r.dietNone], ['vegetarian', r.dietVeg], ['vegan', r.dietVegan]]} />
                    </div>
                    <label className="field">
                      <span>{r.intolerances}</span>
                      <input maxLength={300} placeholder={r.intolerancesPh} value={g.intolerances} onChange={(e) => setGuest(g.key, { intolerances: e.target.value })} />
                    </label>
                    <div className="field">
                      <span>
                        <Icon name="bus" size={16} /> {r.bus}
                      </span>
                      <Segmented name={`bus${g.key}`} value={g.bus} onChange={(v) => setGuest(g.key, { bus: v })} options={[['both', r.busBoth], ['going', r.busGoing], ['return', r.busReturn], ['none', r.busNone]]} />
                    </div>
                  </>
                )}
              </fieldset>
            ))}

            <button type="button" className="btn btn-outline add" onClick={() => setGuests((gs) => (gs.length < 15 ? [...gs, newGuest()] : gs))}>
              <Icon name="plus" size={18} /> {r.addGuest}
            </button>

            <label className="field comment">
              <span>{r.comment}</span>
              <textarea rows={4} maxLength={1500} placeholder={r.commentPh} value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>

            {/* Honeypot anti-spam: invisible para personas */}
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} />

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary submit" disabled={status === 'sending'}>
              {status === 'sending' ? r.sending : r.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
