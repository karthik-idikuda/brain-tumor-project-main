import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { getGeoConsent, getGeoConsentHeader, setGeoConsent } from '../utils/analytics';

const API_BASE = 'http://localhost:8000';

const IMAGES = {
    brainScan: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=800',
    medical: 'https://images.pexels.com/photos/7088522/pexels-photo-7088522.jpeg?auto=compress&cs=tinysrgb&w=800',
    globe: 'https://images.pexels.com/photos/4226219/pexels-photo-4226219.jpeg?auto=compress&cs=tinysrgb&w=800',
    dashboard: 'https://images.pexels.com/photos/7089298/pexels-photo-7089298.jpeg?auto=compress&cs=tinysrgb&w=800',
    upload: 'https://images.pexels.com/photos/6011605/pexels-photo-6011605.jpeg?auto=compress&cs=tinysrgb&w=800',
    process: 'https://images.pexels.com/photos/7089305/pexels-photo-7089305.jpeg?auto=compress&cs=tinysrgb&w=800',
    results: 'https://images.pexels.com/photos/4226264/pexels-photo-4226264.jpeg?auto=compress&cs=tinysrgb&w=800',
    heroVideo: 'https://videos.pexels.com/video-files/7089952/7089952-uhd_2560_1440_25fps.mp4',
    showcaseVideo: 'https://videos.pexels.com/video-files/4316872/4316872-uhd_2560_1440_30fps.mp4',
};

const MARQUEE_IMAGES = [
    { src: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'MRI brain scan on screen' },
    { src: 'https://images.pexels.com/photos/4226219/pexels-photo-4226219.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Doctor reviewing MRI result' },
    { src: 'https://images.pexels.com/photos/5723883/pexels-photo-5723883.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Brain MRI scans on lightbox' },
    { src: 'https://images.pexels.com/photos/7089298/pexels-photo-7089298.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'MRI scan on diagnostic monitor' },
    { src: 'https://images.pexels.com/photos/4226123/pexels-photo-4226123.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Doctor examining brain MRI' },
    { src: 'https://images.pexels.com/photos/7088490/pexels-photo-7088490.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Operating MRI scanner' },
    { src: 'https://images.pexels.com/photos/5723875/pexels-photo-5723875.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Brain MRI cranial anatomy' },
    { src: 'https://images.pexels.com/photos/4226264/pexels-photo-4226264.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Radiologist pointing at MRI' },
    { src: 'https://images.pexels.com/photos/7089614/pexels-photo-7089614.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Person undergoing scan' },
    { src: 'https://images.pexels.com/photos/4226139/pexels-photo-4226139.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Professional examining brain MRI' },
];

function Home() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [modelStatus, setModelStatus] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [geoConsent, setGeoConsentState] = useState(getGeoConsent());
    const fileInputRef = useRef(null);
    const uploadRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_BASE}/upload/model-status`)
            .then(res => setModelStatus(res.data))
            .catch(() => setModelStatus({ loaded: false, message: 'Cannot reach backend server.' }));
    }, []);

    /* ── Parallax on scroll ── */
    useEffect(() => {
        const items = document.querySelectorAll('.parallax-img');
        if (!items.length) return;
        const onScroll = () => {
            items.forEach(el => {
                const rect = el.getBoundingClientRect();
                const offset = (rect.top - window.innerHeight / 2) * 0.08;
                el.style.transform = `translateY(${offset}px)`;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleFile = (f) => {
        if (!f) return;
        if (!f.type.match('image.*')) { setError('Please upload a valid JPG or PNG image.'); return; }
        setFile(f); setPreview(URL.createObjectURL(f)); setError(null); setResult(null);
    };
    const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = () => setIsDragOver(false);
    const onDrop = (e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) { handleFile(e.dataTransfer.files[0]); e.dataTransfer.clearData(); } };
    const clearFile = () => { setFile(null); setPreview(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

    const submitUpload = async (e) => {
        e.preventDefault(); if (!file) return;
        setLoading(true); setError(null); setResult(null);
        const fd = new FormData(); fd.append('file', file);
        try {
            const res = await axios.post(`${API_BASE}/upload/mri/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data', 'X-Geo-Consent': getGeoConsentHeader() }
            });
            setResult(res.data);
        } catch (err) { setError(err.response?.data?.detail || 'Upload failed.'); }
        finally { setLoading(false); }
    };

    const isNegative = result && (result.result?.toLowerCase().includes('no') || result.result?.includes('Class 0'));

    return (
        <main style={{ flex: 1 }}>
            {/* ════════ HERO — Editorial Split ════════ */}
            <section className="hero-editorial">
                <div className="container">
                    <div className="hero-split">
                        <div className="hero-text-col reveal">
                            <div className="hero-eyebrow">
                                AI-Powered Detection System
                            </div>
                            <h1 className="hero-display">
                                <span className="hero-line">Detect.</span>
                                <span className="hero-line">Classify.</span>
                                <span className="hero-line text-accent">Protect.</span>
                            </h1>
                            <p className="hero-caption">
                                Upload an MRI scan for instant deep-learning classification
                                powered by VGG-16 — with geospatial analytics and global health insights.
                            </p>
                            <div className="hero-ctas">
                                <button className="btn-primary-custom" onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                                    <i className="bi bi-cloud-arrow-up"></i> Upload MRI Scan
                                </button>
                                <a href="/dashboard" className="hero-text-link">
                                    Explore Dashboard <i className="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div className="hero-media-col reveal reveal-delay-1">
                            <div className="hero-video-frame">
                                <video autoPlay muted loop playsInline poster={IMAGES.brainScan}>
                                    <source src={IMAGES.heroVideo} type="video/mp4" />
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll-indicator">
                    <div className="scroll-indicator-line"></div>
                    Scroll
                </div>
            </section>

            {/* ════════ STAT STRIP ════════ */}
            <div className="stat-strip reveal">
                <div className="stat-strip-inner">
                    {[
                        { value: '96%', label: 'Accuracy' },
                        { value: 'VGG-16', label: 'Architecture' },
                        { value: '4', label: 'Tumor Classes' },
                        { value: '<2s', label: 'Analysis Speed' },
                        { value: '24/7', label: 'Availability' },
                    ].map((s, i) => (
                        <div className="stat-strip-item" key={i}>
                            <span className="stat-strip-value">{s.value}</span>
                            <span className="stat-strip-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ════════ EDITORIAL FEATURES ════════ */}
            <section className="section-padding">
                <div className="container">
                    {[
                        { num: '01', tag: 'Security', title: 'Secure Processing', desc: 'MRI scans are processed entirely in-memory with zero permanent storage. Only anonymized prediction metadata is retained for research analytics and global trend analysis.', img: IMAGES.medical },
                        { num: '02', tag: 'Global Context', title: 'Worldwide Health Intelligence', desc: 'Combines WHO GLOBOCAN epidemiological data with real-time web-mined trends from public health APIs for deep, actionable global research insights.', img: IMAGES.globe, reversed: true },
                        { num: '03', tag: 'Analytics', title: 'Intelligent Dashboard', desc: 'Explore aggregate scan metrics, geospatial heatmaps, interaction logs, and daily trend charts in a unified analytical command center.', img: IMAGES.dashboard },
                    ].map((f, i) => (
                        <div className={`editorial-row reveal${f.reversed ? ' reversed' : ''}`} key={i}>
                            <div className="editorial-media">
                                <img src={f.img} alt={f.title} loading="lazy" className="parallax-img" />
                            </div>
                            <div className="editorial-text">
                                <span className="editorial-num">{f.num}</span>
                                <span className="editorial-tag">{f.tag}</span>
                                <h2>{f.title}</h2>
                                <p>{f.desc}</p>
                                <div className="editorial-line"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════ INFINITE IMAGE MARQUEE ════════ */}
            <section className="marquee-section">
                <div className="marquee-header reveal">
                    <span className="marquee-eyebrow">See It In Action</span>
                    <h2 className="marquee-title">Real Medical Imaging</h2>
                </div>
                <div className="marquee-track">
                    <div className="marquee-row marquee-row-left">
                        {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
                            <div className="marquee-card" key={`l-${i}`}>
                                <img src={img.src} alt={img.alt} loading="lazy" />
                            </div>
                        ))}
                    </div>
                    <div className="marquee-row marquee-row-right">
                        {[...MARQUEE_IMAGES.slice().reverse(), ...MARQUEE_IMAGES.slice().reverse()].map((img, i) => (
                            <div className="marquee-card" key={`r-${i}`}>
                                <img src={img.src} alt={img.alt} loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ PROCESS / HOW IT WORKS ════════ */}
            <section className="section-padding">
                <div className="container">
                    <div className="text-center mb-5 reveal">
                        <p className="section-title">How It Works</p>
                        <h2 className="section-heading">Three steps to instant diagnosis</h2>
                    </div>
                    <div className="process-timeline">
                        {[
                            { num: '01', title: 'Upload Your Scan', desc: 'Drag and drop your MRI scan or browse from your device. We support JPG and PNG formats up to 10 MB.', img: IMAGES.upload },
                            { num: '02', title: 'AI Processing', desc: 'Our VGG-16 deep learning model analyzes the scan in under 2 seconds, classifying across 4 tumor categories.', img: IMAGES.process },
                            { num: '03', title: 'Get Results', desc: 'Receive a detailed prediction with confidence scores, geospatial context, and links to global health trends.', img: IMAGES.results },
                        ].map((s, i) => (
                            <div className={`process-step reveal reveal-delay-${i + 1}`} key={i}>
                                <div className="process-num-col">
                                    <span className="process-num">{s.num}</span>
                                    {i < 2 && <div className="process-connector"></div>}
                                </div>
                                <div className="process-content">
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                                <div className="process-img">
                                    <img src={s.img} alt={s.title} loading="lazy" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════ UPLOAD ════════ */}
            <section className="section-padding bg-section" ref={uploadRef}>
                <div className="container" style={{ maxWidth: 760 }}>
                    <div className="text-center mb-4 reveal">
                        <p className="section-title">AI Analysis</p>
                        <h2 className="section-heading">Upload Your MRI Scan</h2>
                    </div>

                            {/* Model status */}
                            {modelStatus && (
                                <div className={`model-status ${modelStatus.loaded ? 'ready' : 'error'} reveal`}>
                                    <i className={`bi ${modelStatus.loaded ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ fontSize: '1.15rem' }}></i>
                                    <div>
                                        <strong style={{ display: 'block', fontSize: '0.85rem' }}>
                                            {modelStatus.loaded ? 'AI Model Ready' : 'Model Unavailable'}
                                        </strong>
                                        <span style={{ fontSize: '0.78rem', color: 'inherit', opacity: 0.8 }}>
                                            {modelStatus.loaded ? 'VGG-16 neural network loaded and operational.' : (modelStatus.message || 'Place model file in app/models/ and restart.')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Consent */}
                            <div className="consent-bar reveal">
                                <div className="form-check form-switch" style={{ margin: 0, padding: 0 }}>
                                    <input className="form-check-input" type="checkbox" role="switch" id="geoConsent"
                                        style={{ marginLeft: 0 }}
                                        checked={geoConsent} onChange={(e) => { setGeoConsentState(e.target.checked); setGeoConsent(e.target.checked); }} />
                                </div>
                                <label htmlFor="geoConsent" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    I consent to anonymized location usage for heatmap and trend correlation.
                                </label>
                            </div>

                            {/* Upload Card */}
                            <div className="upload-card reveal">
                                <div className="upload-card-body">
                                    {error && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r-md)', marginBottom: '1.5rem' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--rose)' }}></i>
                                            <span style={{ flex: 1, fontSize: '0.85rem' }}>{error}</span>
                                            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    )}

                                    {!result && !loading && (
                                        <form onSubmit={submitUpload}>
                                            {!file ? (
                                                <div className={`upload-dropzone${isDragOver ? ' dragover' : ''}`}
                                                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                                    onClick={() => fileInputRef.current?.click()}>
                                                    <div className="upload-dropzone-icon"><i className="bi bi-cloud-arrow-up"></i></div>
                                                    <h5>Drop your MRI scan here</h5>
                                                    <p>or click to browse &middot; JPG, PNG up to 10 MB</p>
                                                    <input type="file" style={{ display: 'none' }} ref={fileInputRef}
                                                        onChange={(e) => handleFile(e.target.files[0])} accept="image/jpeg,image/png" />
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                                                        <img src={preview} alt="MRI Preview"
                                                            style={{ maxHeight: 260, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', objectFit: 'contain' }} />
                                                        <button type="button" onClick={clearFile}
                                                            style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'var(--rose)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                    <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{file.name}</p>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <button type="submit" className="btn-accent-solid" disabled={!modelStatus?.loaded}>
                                                        <i className="bi bi-lightning-charge-fill"></i> Run AI Analysis
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    )}

                                    {loading && (
                                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                            <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
                                            <h5 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Analyzing MRI Scan</h5>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Running inference through VGG-16 neural network&hellip;</p>
                                        </div>
                                    )}

                                    {result && (
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                                <span className="tag tag-green"><i className="bi bi-stars"></i> Analysis Complete</span>
                                            </div>

                                            <div className="row g-4 align-items-center" style={{ marginBottom: '1.5rem' }}>
                                                <div className="col-md-5" style={{ textAlign: 'center' }}>
                                                    <img src={preview} alt="MRI"
                                                        style={{ maxHeight: 220, borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', maxWidth: '100%' }} />
                                                </div>
                                                <div className="col-md-7">
                                                    <div className={`result-box ${isNegative ? 'negative' : 'positive'}`} style={{ marginBottom: '1rem' }}>
                                                        <i className={`bi ${isNegative ? 'bi-shield-check' : 'bi-exclamation-triangle-fill'}`}
                                                            style={{ fontSize: '1.75rem', color: isNegative ? 'var(--accent)' : 'var(--rose)' }}></i>
                                                        <h3 style={{ fontWeight: 800, color: isNegative ? 'var(--accent)' : 'var(--rose)', marginTop: '0.5rem', marginBottom: 0 }}>
                                                            {result.result}
                                                        </h3>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {[
                                                            ['Confidence', result.confidence, { color: 'var(--accent)', fontWeight: 700 }],
                                                            ['File', result.filename, { fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }],
                                                            ['Origin', `${result.location?.city || 'Unknown'}, ${result.location?.country || 'Unknown'}`, { fontWeight: 600 }],
                                                        ].map(([label, value, st], i) => (
                                                            <div key={i} className="result-detail-row">
                                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
                                                                <span style={{ fontSize: '0.88rem', ...st }}>{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn-secondary-custom" onClick={clearFile} style={{ width: '100%', justifyContent: 'center' }}>
                                                <i className="bi bi-arrow-counterclockwise"></i> Analyze Another Scan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                </div>
            </section>

            {/* ════════ CTA — Dark ════════ */}
            <section className="cta-dark">
                <div className="container cta-dark-content reveal">
                    <p className="cta-dark-eyebrow">Get Started</p>
                    <h2>Ready to detect<br />brain tumors with AI?</h2>
                    <p className="cta-dark-desc">Join researchers worldwide using deep learning for faster, more accurate brain tumor classification.</p>
                    <button className="btn-accent-solid" onClick={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                        <i className="bi bi-cloud-arrow-up"></i> Start Analysis Now
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Home;
