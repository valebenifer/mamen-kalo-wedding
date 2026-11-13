import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import { Venues, Timeline, Transport, Tips, Footer } from './components/Sections.jsx';
import Rsvp from './components/Rsvp.jsx';
import { AdminLogin, AdminDashboard, useAdminSession } from './components/Admin.jsx';
import { useReveal } from './components/common.jsx';

const isAdminPath = () => window.location.pathname.replace(/\/$/, '') === '/admin';

export default function App() {
  const [admin, setAdmin] = useState(isAdminPath);
  const { session, setSession, logout } = useAdminSession();

  useEffect(() => {
    const on = () => setAdmin(isAdminPath());
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);

  useReveal(admin);

  const openAdmin = () => {
    history.pushState(null, '', '/admin');
    setAdmin(true);
    window.scrollTo(0, 0);
  };

  const goHome = useCallback((id) => {
    if (isAdminPath()) history.pushState(null, '', '/');
    setAdmin(false);
    setTimeout(() => {
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
  }, []);

  if (admin) {
    return session.token ? (
      <AdminDashboard token={session.token} user={session.user} onLogout={logout} onClose={() => goHome(null)} />
    ) : (
      <AdminLogin onLogin={(token, user) => setSession({ token, user })} onClose={() => goHome(null)} />
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
