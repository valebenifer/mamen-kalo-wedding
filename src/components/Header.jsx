import { useEffect, useState } from 'react';
import { useI18n, langLabel, LANGS } from '../i18n/provider.jsx';
import { Logo, Icon } from './common.jsx';

const LINKS = ['venues', 'timeline', 'transport', 'tips', 'rsvp'];

export default function Header({ onAdmin, onHome, solid = false }) {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const go = (id) => {
    setOpen(false);
    if (onHome) onHome(id);
  };

  return (
    <header className={`site-header ${scrolled || solid || open ? 'solid' : ''}`}>
      <div className="header-inner">
        <a
          href="/"
          className="brand"
          aria-label="Mamen & Kalo"
          onClick={(e) => {
            e.preventDefault();
            go(null);
          }}
        >
          <Logo size={46} />
        </a>

        <nav className={`nav ${open ? 'open' : ''}`} aria-label="principal">
          {LINKS.map((k) => (
            <a key={k} href={`/#${k}`} onClick={(e) => { e.preventDefault(); go(k); }}>
              {t.nav[k]}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang" role="group" aria-label="Idioma / Language / Език">
            {Object.keys(LANGS).map((l) => (
              <button key={l} className={l === lang ? 'active' : ''} onClick={() => setLang(l)} aria-pressed={l === lang} lang={l}>
                {langLabel(l)}
              </button>
            ))}
          </div>
          <button className="admin-link" onClick={onAdmin} aria-label={t.nav.admin}>
            <Icon name="lock" size={16} />
            <span>{t.nav.admin}</span>
          </button>
          <button className="burger" onClick={() => setOpen((o) => !o)} aria-label={t.nav.menu} aria-expanded={open}>
            <Icon name={open ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
