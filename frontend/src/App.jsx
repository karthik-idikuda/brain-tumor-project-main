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

  useEffect(() => {
    trackInteraction('page_view', location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="app-shell d-flex flex-column min-vh-100" data-bs-theme="dark">
        <RouteTracker />
        <Navbar />
        <main className="container py-4 py-lg-5" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trends-page" element={<Trends />} />
            <Route path="/analytics-page" element={<Analytics />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
