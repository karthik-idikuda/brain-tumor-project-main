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
                const requests = [axios.get(`${API_BASE}/analytics/predictions`)];
                if (geoConsent) {
                    requests.push(axios.get(`${API_BASE}/analytics/my-location/`));
                }

                const responses = await Promise.all(requests);
                const histRes = responses[0];
                const locRes = responses[1] || null;

                setHistory(histRes.data.predictions);
                setLocation(locRes ? locRes.data : null);
            } catch (err) {
                console.error("Analytics fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [geoConsent]);

    return (
        <div className="container py-4">
             <div className="row g-4">
                {/* Location Card */}
                <div className="col-lg-4">
                    <div className="card card-glass h-100">
                        <div className="card-body">
                            <h5 className="card-title fw-bold mb-4">
                                <i className="bi bi-geo-alt-fill text-accent me-2"></i> 
                                Your Connection Profile
                            </h5>
                            {loading ? (
                                <div className="text-center py-4"><div className="spinner-border text-accent"></div></div>
                            ) : !geoConsent ? (
                                <div className="text-center p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <p className="text-muted mb-3">Location insights are disabled until consent is enabled.</p>
                                    <button
                                        className="btn btn-accent btn-sm"
                                        onClick={() => {
                                            setGeoConsent(true);
                                            setGeoConsentState(true);
                                            setLoading(true);
                                        }}
                                    >
                                        Enable Location Insights
                                    </button>
                                </div>
                            ) : location ? (
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        <i className="bi bi-globe fs-2 text-muted"></i>
                                        <div>
                                            <p className="text-muted small mb-0">Detected IP Address</p>
                                            <p className="fw-bold mb-0 font-monospace">{location.ip}</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        <i className="bi bi-geo fs-2 text-accent"></i>
                                        <div>
                                            <p className="text-muted small mb-0">Detected Location</p>
                                            <p className="fw-bold mb-0">{location.city}, {location.country}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <span className="badge bg-success-subtle border border-success-subtle text-success text-bg-dark w-100 p-2">
                                            <i className="bi bi-check-circle-fill me-1"></i> Connected & Logging
                                        </span>
                                        <p className="text-muted small mt-2">
                                            Your session is securely established. Activity is logged to build global health heatmaps.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">Unable to detect location context.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="col-lg-8">
                    <div className="card card-glass h-100">
                        <div className="card-body">
                            <h5 className="card-title fw-bold mb-4">
                                <i className="bi bi-journal-medical text-accent me-2"></i>
                                Global Prediction History
                            </h5>
                            
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-accent"></div></div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                                    No predictions have been recorded yet.
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '500px' }}>
                                    <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                        <thead className="border-bottom border-light" style={{ borderColor: 'rgba(255,255,255,0.1)!important' }}>
                                            <tr>
                                                <th className="text-muted font-monospace small">ID</th>
                                                <th className="text-muted font-monospace small">TIME</th>
                                                <th className="text-muted font-monospace small">FILENAME</th>
                                                <th className="text-muted font-monospace small">RESULT</th>
                                                <th className="text-muted font-monospace small text-end">CONFIDENCE</th>
                                                <th className="text-muted font-monospace small text-end">ORIGIN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(row => (
                                                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td className="text-muted">#{row.id}</td>
                                                    <td className="small">{new Date(row.timestamp + 'Z').toLocaleString()}</td>
                                                    <td><span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }} title={row.filename}>{row.filename}</span></td>
                                                    <td>
                                                        <span className={`badge ${row.result === 'Tumor Detected' ? 'bg-danger text-light' : 'bg-success text-light'}`}>
                                                            {row.result}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-semibold font-monospace">{row.confidence}%</td>
                                                    <td className="text-end">
                                                        <span className="badge bg-secondary">
                                                            <i className="bi bi-pin-map-fill me-1"></i>
                                                            {row.country || 'Unknown'}
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
    );
}

export default Analytics;
