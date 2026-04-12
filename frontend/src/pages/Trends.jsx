import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://brain-tumor-project-main.vercel.app';

function Trends() {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE}/trends/`)
            .then(res => { setNewsData(res.data); setLoading(false); })
            .catch(err => { setError(err.response?.data?.detail || 'Failed to load trends.'); setLoading(false); });
    }, []);

    return (
        <div>
            {/* ── Page Hero ────────────────────── */}
            <div className="page-hero">
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                        <h1>Global Trends</h1>
                        <p>Real-time brain tumor research news mined from public sources</p>
                    </div>
                    {newsData?.articles && (
                        <span className="tag tag-gray">
                            <i className="bi bi-newspaper"></i> {newsData.articles.length} article{newsData.articles.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '2rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
                        <h6 style={{ fontWeight: 600 }}>Mining Latest News&hellip;</h6>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fetching from public health news APIs</p>
                    </div>
                ) : error ? (
                    <div className="chart-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <i className="bi bi-wifi-off" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}></i>
                        <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Trends Unavailable</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{error}</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {newsData?.articles?.map((article, idx) => (
                            <div key={idx} className="col-md-6 col-lg-4">
                                <div className={`news-card reveal reveal-delay-${(idx % 4) + 1}`}>
                                    <div className="news-card-img">
                                        {article.image_url ? (
                                            <img src={article.image_url} alt="" />
                                        ) : (
                                            <i className="bi bi-image" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
                                        )}
                                    </div>
                                    <div className="news-card-body">
                                        <h5>{article.title}</h5>
                                        <p>{article.description || 'No description available.'}</p>
                                        <div className="news-card-footer">
                                            <div className="news-card-source">
                                                <strong><i className="bi bi-newspaper" style={{ marginRight: 3 }}></i>{article.source}</strong>
                                                <br />
                                                <span><i className="bi bi-calendar3" style={{ marginRight: 3 }}></i>{new Date(article.published_at).toLocaleDateString()}</span>
                                            </div>
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn-secondary-custom btn-sm-custom">
                                                Read <i className="bi bi-arrow-up-right" style={{ marginLeft: 3 }}></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Trends;
