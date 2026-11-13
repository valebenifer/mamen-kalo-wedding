import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import es from './es.js';
import en from './en.js';
import bg from './bg.js';

export const LANGS = { es, en, bg };
const LabelFor = { es: 'ES', en: 'EN', bg: 'БГ' };
export const langLabel = (l) => LabelFor[l];

const Ctx = createContext(null);

function initialLang() {
  const saved = localStorage.getItem('lang');
  if (saved && LANGS[saved]) return saved;
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return LANGS[nav] ? nav : 'es';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.title = LANGS[lang].meta.title;
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t: LANGS[lang] }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
