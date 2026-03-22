import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { getGeoConsent, getGeoConsentHeader, setGeoConsent } from '../utils/analytics';

const API_BASE = 'http://localhost:8000';

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

    useEffect(() => {
        axios.get(`${API_BASE}/upload/model-status`)
            .then(res => setModelStatus(res.data))
            .catch(err => {
                setModelStatus({ loaded: false, message: "Could not connect to backend server." });
                console.error("Model status error", err);
            });
    }, []);

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;
        if (!selectedFile.type.match('image.*')) {
            setError('Please upload a valid image file (JPG/PNG).');
            return;
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError(null);
        setResult(null);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onDragLeave = () => {
        setIsDragOver(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const submitUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE}/upload/mri/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Geo-Consent': getGeoConsentHeader(),
                }
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-5">
                <div className="hero-glow mb-4">
                    <i className="bi bi-cpu text-accent hero-icon"></i>
                </div>
                <h1 className="fw-bold mb-3">AI-Powered Brain Tumor Detection</h1>
                <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                    Upload an MRI scan for instant deep-learning based tumor classification. Results are paired with trend and geospatial insights for awareness and research context.
                </p>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Model Status Alert */}
                    {modelStatus && (
                        <div className={`alert d-flex align-items-center gap-2 mb-4 ${modelStatus.loaded ? 'alert-success' : 'alert-danger'}`}>
                            <i className={modelStatus.loaded ? "bi bi-check-circle-fill" : "bi bi-x-circle-fill"}></i>
                            <span>
                                {modelStatus.loaded
                                    ? 'AI model loaded and ready.'
                                    : (modelStatus.message || 'AI model not found. Place model file in app/models/ and restart backend server.')}
                            </span>
                        </div>
                    )}

                    <div className="card card-glass p-3 mb-4 consent-card">
                        <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="geoConsent"
                                checked={geoConsent}
                                onChange={(e) => {
                                    const enabled = e.target.checked;
                                    setGeoConsentState(enabled);
                                    setGeoConsent(enabled);
                                }}
                            />
                            <label className="form-check-label" htmlFor="geoConsent">
                                I consent to anonymized location usage for heatmap and trend correlation.
                            </label>
                        </div>
                    </div>

                    <div className="card card-glass overflow-hidden shadow-lg p-4">
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <i className="bi bi-exclamation-octagon-fill me-2"></i>
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                            </div>
                        )}

                        {!result && !loading && (
                            <form onSubmit={submitUpload}>
                                {!file ? (
                                    <div 
                                        className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="bi bi-cloud-arrow-up upload-zone-icon"></i>
                                        <h5 className="fw-bold text-light">Click or Drag & Drop MRI Scan</h5>
                                        <p className="text-muted small">Supports JPG and PNG up to 10MB</p>
                                        <input 
                                            type="file" 
                                            className="d-none" 
                                            ref={fileInputRef}
                                            onChange={(e) => handleFile(e.target.files[0])}
                                            accept="image/jpeg, image/png" 
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="position-relative d-inline-block mb-3">
                                            <img src={preview} alt="MRI Preview" className="img-thumbnail bg-dark border-secondary rounded" style={{ maxHeight: "250px" }} />
                                            <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle" onClick={clearFile} style={{ width: "32px", height: "32px", padding: 0 }}>
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                        <div className="mb-4">
                                            <p className="fw-bold mb-0 text-light">{file.name}</p>
                                            <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                        </div>
                                        <button type="submit" className="btn btn-accent btn-lg w-100 rounded-pill shadow" disabled={!modelStatus?.loaded}>
                                            <i className="bi bi-magic me-2"></i> Run AI Analysis
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}

                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-accent mb-3" style={{ width: "4rem", height: "4rem" }} role="status"></div>
                                <h4 className="fw-bold text-light">Analyzing MRI Scan...</h4>
                                <p className="text-muted">Running deep neural network pathways</p>
                            </div>
                        )}

                        {result && (
                            <div>
                                <h3 className="text-center fw-bold mb-4 border-bottom border-light pb-3" style={{ borderColor: 'rgba(255,255,255,0.1)!important' }}>Analysis Complete</h3>
                                
                                <div className="row g-4 align-items-center mb-4">
                                    <div className="col-md-5 text-center">
                                        <img src={preview} className="img-fluid rounded border border-secondary shadow-sm" alt="Analyzed MRI" />
                                    </div>
                                    <div className="col-md-7">
                                        <div className={`p-4 rounded shadow-sm text-center mb-3 ${result.result === 'Tumor Detected' ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-success bg-opacity-10 border border-success'}`}>
                                            <div className="mb-2">
                                                {result.result === 'Tumor Detected' ? (
                                                    <i className="bi bi-exclamation-triangle-fill text-danger hero-icon"></i>
                                                ) : (
                                                    <i className="bi bi-check-circle-fill text-success hero-icon"></i>
                                                )}
                                            </div>
                                            <h2 className={`fw-bold ${result.result === 'Tumor Detected' ? 'text-danger' : 'text-success'}`}>
                                                {result.result}
                                            </h2>
                                        </div>
                                        
                                        <div className="card bg-dark text-light border-secondary">
                                            <ul className="list-group list-group-flush list-group-dark">
                                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                                                    <span className="text-muted">AI Confidence Score</span>
                                                    <span className="fw-bold fs-5 text-accent">{result.confidence}</span>
                                                </li>
                                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                                                    <span className="text-muted">Scan Target</span>
                                                    <span className="fw-semibold text-truncate ms-2 text-end" style={{ maxWidth: "200px" }}>{result.filename}</span>
                                                </li>
                                                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                                                    <span className="text-muted">Origin</span>
                                                    <span className="fw-semibold">
                                                        <i className="bi bi-geo-alt-fill text-accent me-1"></i>
                                                        {result.location?.city || 'Unknown'}, {result.location?.country || 'Unknown'}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-light w-100 rounded-pill" onClick={clearFile}>
                                    <i className="bi bi-arrow-counterclockwise me-2"></i> Analyze Another Scan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row text-center mt-5 g-4 border-top border-light pt-5" style={{ borderColor: 'rgba(255,255,255,0.05)!important' }}>
                <div className="col-md-4">
                    <i className="bi bi-shield-check module-icon text-muted mb-3 d-inline-block"></i>
                    <h5 className="fw-bold">Secure Processing</h5>
                    <p className="text-muted small">MRI files are processed in memory and prediction metadata is stored for dashboard analytics.</p>
                </div>
                <div className="col-md-4">
                    <i className="bi bi-globe-americas module-icon text-muted mb-3 d-inline-block"></i>
                    <h5 className="fw-bold">Global Context</h5>
                    <p className="text-muted small">Combines WHO incidence references and real-time public trend mining.</p>
                </div>
                <div className="col-md-4">
                    <i className="bi bi-clipboard-data module-icon text-muted mb-3 d-inline-block"></i>
                    <h5 className="fw-bold">Intelligent Dashboard</h5>
                    <p className="text-muted small">Explore aggregate metrics, interaction activity, and geospatial heatmaps.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
