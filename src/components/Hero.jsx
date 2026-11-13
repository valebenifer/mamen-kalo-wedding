import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/provider.jsx';
import { WEDDING, ceremonyDate } from '../config.js';
import { Icon } from './common.jsx';

function useCountdown() {
  const [left, setLeft] = useState(() => ceremonyDate() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(ceremonyDate() - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, left);
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

export default function Hero() {
  const { t } = useI18n();
  const c = useCountdown();
  const date = new Intl.DateTimeFormat(t.meta.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${WEDDING.date}T12:00:00`));

  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-text">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>
            <span>Mamen</span>
            <em>&amp;</em>
            <span>Kalo</span>
          </h1>
          <p className="hero-date">{date}</p>
          <p className="hero-place">{t.hero.place}</p>

          <div className="countdown" role="timer">
            {['days', 'hours', 'minutes', 'seconds'].map((k) => (
              <div key={k}>
                <strong>{String(c[k]).padStart(2, '0')}</strong>
                <span>{t.hero[k]}</span>
              </div>
            ))}
          </div>

          <a className="btn btn-primary" href="#rsvp">
            {t.hero.cta} <Icon name="arrow" size={18} />
          </a>
        </div>

        <div className="hero-photo">
          <div className="arch">
            <img src="/images/novios.webp" alt={t.hero.photoAlt} width="1280" height="960" fetchPriority="high" />
          </div>
        </div>
      </div>
    </section>
  );
}
