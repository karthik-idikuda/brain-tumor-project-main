function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-brand">
          <span className="footer-brand-icon"><i className="bi bi-heart-pulse"></i></span>
          BrainScan<span className="text-accent">AI</span>
        </div>
        <p className="footer-text" style={{ maxWidth: 480 }}>
          Built by <strong style={{ color: '#fff' }}>Ishika Kaur</strong>,{' '}
          <strong style={{ color: '#fff' }}>K Praveen Kumar</strong> &amp;{' '}
          <strong style={{ color: '#fff' }}>Karthik Idikuda</strong>
        </p>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} BrainScanAI. Educational use only.</span>
          <span>
            <i className="bi bi-shield-exclamation" style={{ marginRight: 4 }}></i>
            Always consult qualified medical professionals.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
