import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-activity text-accent"></i>
          <span className="fw-bold">BrainScan<span className="text-accent">AI</span></span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/' ? 'active' : ''}`} to="/">
                <i className="bi bi-house-door"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/dashboard' ? 'active' : ''}`} to="/dashboard">
                <i className="bi bi-grid-1x2"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/trends-page' ? 'active' : ''}`} to="/trends-page">
                <i className="bi bi-globe2"></i> Trend Mining
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/analytics-page' ? 'active' : ''}`} to="/analytics-page">
                <i className="bi bi-bar-chart-line"></i> User Analytics
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
