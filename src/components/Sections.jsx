import { useI18n } from '../i18n/provider.jsx';
import { WEDDING, MAPS, TIMELINE } from '../config.js';
import { Icon, SectionHead } from './common.jsx';

export function Venues() {
  const { t } = useI18n();
  const v = t.venues;
  const cards = [
    { ...v.church, img: `${import.meta.env.BASE_URL}images/iglesia.webp`, w: 1100, h: 1650, map: MAPS.church },
    { ...v.cortijo, img: `${import.meta.env.BASE_URL}images/cortijo.webp`, w: 1280, h: 854, map: MAPS.cortijo },
  ];
  return (
    <section className="section" id="venues">
      <div className="container">
        <SectionHead eyebrow={v.eyebrow} title={v.title} subtitle={v.subtitle} />
        <div className="venues">
          {cards.map((c, i) => (
            <article key={i} className={`venue reveal ${i % 2 ? 'flip' : ''}`}>
              <div className="arch venue-photo">
                <img src={c.img} alt={c.alt} width={c.w} height={c.h} loading="lazy" />
              </div>
              <div className="venue-body">
                <p className="eyebrow">{c.tag}</p>
                <h3>{c.name}</h3>
                <p className="place">
                  <Icon name="pin" size={16} /> {c.place}
                </p>
                <p>{c.text}</p>
                <a className="btn btn-outline" href={c.map} target="_blank" rel="noopener noreferrer">
                  <Icon name="pin" size={18} /> {v.map}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="arrival reveal">
          <div className="arrival-inner">
            <p className="eyebrow">{t.arrival.eyebrow}</p>
            <h3>{t.arrival.title}</h3>
            <p>
              {t.arrival.text} <strong className="big-time">{WEDDING.arrival}</strong>
            </p>
            <p className="muted">{t.arrival.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Timeline() {
  const { t } = useI18n();
  const tl = t.timeline;
  return (
    <section className="section alt" id="timeline">
      <div className="container narrow">
        <SectionHead eyebrow={tl.eyebrow} title={tl.title} subtitle={tl.subtitle} />
        <ol className="timeline">
          {TIMELINE.map((e) => (
            <li key={e.key} className={`reveal ${e.highlight ? 'highlight' : ''}`}>
              <time>{e.time}</time>
              <span className="dot" aria-hidden="true" />
              <div>
                <h3>{tl.items[e.key].title}</h3>
                <p>{tl.items[e.key].text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="muted center small">{tl.disclaimer}</p>
      </div>
    </section>
  );
}

export function Transport() {
  const { t } = useI18n();
  const tr = t.transport;
  return (
    <section className="section" id="transport">
      <div className="container">
        <SectionHead eyebrow={tr.eyebrow} title={tr.title} subtitle={tr.subtitle} />
        <div className="cards two">
          <article className="card reveal">
            <Icon name="bus" size={34} className="card-icon" />
            <h3>{tr.bus.title}</h3>
            <p>{tr.bus.text}</p>
            <ul className="bus-times">
              <li>
                <span>{tr.bus.out}</span>
                <strong>{WEDDING.busOut}</strong>
                <small>{tr.bus.outWhere}</small>
              </li>
              <li>
                <span>{tr.bus.back}</span>
                <strong>{WEDDING.busBack}</strong>
                <small>{tr.bus.backWhere}</small>
              </li>
            </ul>
            <a className="btn btn-outline" href={MAPS.busStop} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={18} /> {tr.bus.map}
            </a>
          </article>

          <article className="card reveal">
            <Icon name="car" size={34} className="card-icon" />
            <h3>{tr.car.title}</h3>
            <p>{tr.car.text}</p>
            <a className="btn btn-outline" href={MAPS.cortijo} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={18} /> {tr.car.map}
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Tips() {
  const { t } = useI18n();
  const tp = t.tips;
  return (
    <section className="section alt" id="tips">
      <div className="container">
        <SectionHead eyebrow={tp.eyebrow} title={tp.title} />
        <div className="cards four">
          {tp.items.map((it, i) => (
            <article key={i} className="card tip reveal">
              <Icon name={it.icon} size={30} className="card-icon" />
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <p className="footer-names">Mamen &amp; Kalo</p>
      <p>{t.footer.hashtag}</p>
      <p className="muted small">{t.footer.made}</p>
    </footer>
  );
}
