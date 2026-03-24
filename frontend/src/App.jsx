import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Analytics from './pages/Analytics';
import { trackInteraction } from './utils/analytics';

function RouteTracker() {
  const location = useLocation();
  useEffect(() => { trackInteraction('page_view', location.pathname); }, [location.pathname]);
  return null;
}

/* Scroll-reveal observer — fires .visible on elements with .reveal */
function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const watch = () => document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    watch();
    const id = setInterval(watch, 800);
    return () => { clearInterval(id); observer.disconnect(); };
  }, []);
  return null;
}

function App() {
  const loc = useLocation();
  const isHome = loc.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RevealObserver />
      <RouteTracker />
      <Navbar />
      {isHome ? (
        <Home />
      ) : (
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trends-page" element={<Trends />} />
            <Route path="/analytics-page" element={<Analytics />} />
          </Routes>
        </main>
      )}
      <Footer />
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  );
}
