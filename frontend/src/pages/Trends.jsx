import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function Trends() {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE}/trends/`)
            .then(res => {
                setNewsData(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.detail || 'Failed to load news trends.');
                setLoading(false);
            });
    }, []);

    return (
        <div className="container py-4">
            <h3 className="fw-bold mb-4"><i className="bi bi-globe2 text-accent"></i> Global <span className="text-accent">Trends</span></h3>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-accent mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <h5>Mining Latest News...</h5>
                </div>
            ) : error ? (
                <div className="alert alert-danger text-center p-4">
                    <i className="bi bi-x-circle-fill text-danger hero-icon mb-3 d-block"></i>
                    <h5 className="fw-bold">Trends Unavailable</h5>
                    <p className="mb-0">{error}</p>
                </div>
            ) : (
                <div className="row g-4">
                    {newsData?.articles?.map((article, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4">
                            <div className="card card-glass h-100 outline-hover">
                                {article.image_url ? (
                                    <img src={article.image_url} className="card-img-top object-fit-cover border-bottom border-secondary" style={{ height: '200px' }} alt="News" />
                                ) : (
                                    <div className="bg-dark text-muted d-flex align-items-center justify-content-center border-bottom border-secondary" style={{ height: '200px' }}>
                                        <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fs-6 fw-bold text-light mb-2">{article.title}</h5>
                                    <p className="card-text small text-muted text-truncate-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {article.description || "No description available."}
                                    </p>
                                    <div className="mt-3">
                                        <small className="text-accent d-block mb-2"><i className="bi bi-newspaper"></i> {article.source}</small>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light w-100">
                                            Read Full Article <i className="bi bi-box-arrow-up-right ms-1"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent border-top-0 pt-0 text-muted small">
                                    <i className="bi bi-calendar3"></i> {new Date(article.published_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Trends;
