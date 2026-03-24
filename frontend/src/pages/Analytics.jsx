import { useState, useEffect } from 'react';
import axios from 'axios';
import { getGeoConsent, setGeoConsent } from '../utils/analytics';

const API_BASE = 'http://localhost:8000';

function Analytics() {
    const [history, setHistory] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [geoConsent, setGeoConsentState] = useState(getGeoConsent());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reqs = [axios.get(`${API_BASE}/analytics/predictions`)];
                if (geoConsent) reqs.push(axios.get(`${API_BASE}/analytics/my-location/`));
                const res = await Promise.all(reqs);
                setHistory(res[0].data.predictions);
                setLocation(res[1]?.data ?? null);
            } catch (err) { console.error('Analytics fetch error:', err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [geoConsent]);

    return (
        <div>
            {/* ── Page Hero ────────────────────── */}
            <div className="page-hero">
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                        <h1>User Analytics</h1>
                        <p>Connection profile, prediction history and session insights</p>
                    </div>
                    <span className="tag tag-gray">
                        <i className="bi bi-clock-history"></i> {history.length} record{history.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="container">
                <div className="row g-4">
                    {/* ── Connection Profile ──────── */}
                    <div className="col-lg-4">
                        <div className="profile-card reveal" style={{ height: '100%' }}>
                            <div className="profile-card-header">
                                <i className="bi bi-person-circle" style={{ marginRight: 6 }}></i> Connection Profile
                            </div>
                            <div className="profile-card-body">
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                        <div className="loader" style={{ margin: '0 auto', width: 36, height: 36, borderWidth: 2 }}></div>
                                    </div>
                                ) : !geoConsent ? (
                                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-section)', borderRadius: 'var(--r-md)' }}>
                                        <i className="bi bi-geo-alt" style={{ fontSize: '2rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}></i>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                            Location insights are disabled until consent is granted on the Home page.
                                        </p>
                                        <button className="btn-accent-solid btn-sm-custom"
                                            onClick={() => { setGeoConsent(true); setGeoConsentState(true); setLoading(true); }}>
                                            Enable Location
                                        </button>
                                    </div>
                                ) : location ? (
                                    <div>
                                        <div className="profile-row">
                                            <span className="profile-row-icon"><i className="bi bi-globe"></i></span>
                                            <div>
                                                <span className="profile-row-label">IP Address</span>
                                                <span className="profile-row-value font-mono">{location.ip}</span>
                                            </div>
                                        </div>
                                        <div className="profile-row">
                                            <span className="profile-row-icon"><i className="bi bi-geo-alt-fill" style={{ color: 'var(--accent)' }}></i></span>
                                            <div>
                                                <span className="profile-row-label">Location</span>
                                                <span className="profile-row-value">{location.city}, {location.country}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <span className="tag tag-green"><i className="bi bi-check-circle-fill"></i> Session Connected</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unable to detect location context.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Prediction History ──────── */}
                    <div className="col-lg-8">
                        <div className="chart-card reveal reveal-delay-1" style={{ height: '100%' }}>
                            <div className="chart-card-header">
                                <h6 className="chart-card-title">Prediction History</h6>
                            </div>
                            <div className="chart-card-body" style={{ padding: 0 }}>
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                        <div className="loader" style={{ margin: '0 auto' }}></div>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}></i>
                                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No predictions yet</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Upload an MRI scan to see results here.</p>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto', maxHeight: 520 }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Time</th>
                                                    <th>Filename</th>
                                                    <th>Result</th>
                                                    <th style={{ textAlign: 'right' }}>Confidence</th>
                                                    <th style={{ textAlign: 'right' }}>Origin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map(row => (
                                                    <tr key={row.id}>
                                                        <td style={{ color: 'var(--text-muted)' }}>#{row.id}</td>
                                                        <td style={{ fontSize: '0.82rem' }}>{new Date(row.timestamp + 'Z').toLocaleString()}</td>
                                                        <td>
                                                            <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }} title={row.filename}>
                                                                {row.filename}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`tag ${row.result?.toLowerCase().includes('no') ? 'tag-green' : 'tag-rose'}`}>
                                                                {row.result}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{row.confidence}%</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <span className="tag tag-gray">
                                                                <i className="bi bi-pin-map-fill"></i> {row.country || 'Unknown'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
