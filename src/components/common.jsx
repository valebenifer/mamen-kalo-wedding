import { useEffect } from 'react';

/** Monograma M + K dentro de un arco de herradura (guiño andaluz) */
export function Logo({ size = 44, className = '' }) {
  return (
    <svg className={`logo ${className}`} width={size} height={size * 1.15} viewBox="0 0 80 92" role="img" aria-label="M & K">
      <path d="M8 88V42a32 32 0 0 1 64 0v46" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 88V43a26 26 0 0 1 52 0v45" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".55" />
      <text x="29" y="64" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="38" fontWeight="500" fill="currentColor">M</text>
      <text x="53" y="64" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="38" fontStyle="italic" fontWeight="500" fill="currentColor">K</text>
      <circle cx="40" cy="78" r="1.6" fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  dress: <path d="M9 3l3 3 3-3 1.5 6-2.5 3.5L18 21H6l3.5-8.5L7.5 9z" />,
  shoe: <path d="M3 18h18M4 18c0-6 2-10 2-10l4 3 4 2c3 1 6 2 6 5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  wrap: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18.5h2" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01M8.5 14.5c1 1.6 2.2 2.3 3.5 2.3s2.5-.7 3.5-2.3" />
    </>
  ),
  food: <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14zM5 19l8-8" />,
  bus: (
    <>
      <rect x="4" y="3.5" width="16" height="14" rx="2.5" />
      <path d="M4 11h16M8 21v-3.5M16 21v-3.5M8 14.5h.01M16 14.5h.01" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-4l2-5h12l2 5v4zM4 16v2M20 16v2M4 12h16" />
      <path d="M8 14h.01M16 14h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  refresh: <path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function Icon({ name, size = 22, className = '' }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/** Detalle de azulejo / cenefa andaluza (SVG repetible por CSS) */
export function TileDivider() {
  return (
    <div className="tile-divider" aria-hidden="true">
      <span />
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M13 1l3.5 7.5L24 9l-5.5 5 1.5 8L13 18l-7 4 1.5-8L2 9l7.5-.5z" opacity=".0" />
        <path d="M13 2l2.6 6.4L22 11l-6.4 2.6L13 20l-2.6-6.4L4 11l6.4-2.6z" />
        <circle cx="13" cy="11" r="1.6" fill="currentColor" stroke="none" />
      </svg>
      <span />
    </div>
  );
}

export function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <header className="section-head reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <TileDivider />
      {subtitle && <p className="lead">{subtitle}</p>}
    </header>
  );
}

/** Revela con fundido los elementos .reveal al entrar en pantalla */
export function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dep]);
}
