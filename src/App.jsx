import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { Venues, Timeline, Transport, Tips, Footer } from './components/Sections.jsx';
import Rsvp from './components/Rsvp.jsx';
import { AdminLogin, AdminDashboard } from './components/Admin.jsx';
import { useReveal } from './components/common.jsx';
import { currentAdmin, logout } from './api.js';

// GitHub Pages no admite rutas tipo /admin al recargar, así que el panel vive en #/admin
const isAdminHash = () => window.location.hash.startsWith('#/admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash);
  const [user, setUser] = useState(currentAdmin);

  useEffect(() => {
    const on = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useReveal(admin);

  const openAdmin = () => {
    window.location.hash = '/admin';
    window.scrollTo(0, 0);
  };

  const goHome = useCallback((id) => {
    if (isAdminHash()) history.pushState(null, '', window.location.pathname + window.location.search);
    setAdmin(false);
    setTimeout(() => {
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
  }, []);

  const doLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  if (admin) {
    return user ? (
      <AdminDashboard user={user} onLogout={doLogout} onClose={() => goHome(null)} />
    ) : (
      <AdminLogin onLogin={setUser} onClose={() => goHome(null)} />
    );
  }

  return (
    <>
      <Header onAdmin={openAdmin} onHome={goHome} />
      <main>
        <Hero />
        <Venues />
        <Timeline />
        <Transport />
        <Tips />
        <Rsvp />
      </main>
      <Footer />
    </>
  );
}
