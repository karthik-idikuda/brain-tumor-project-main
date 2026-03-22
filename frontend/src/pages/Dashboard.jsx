import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);
ChartJS.defaults.color = '#e2e8f0';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

const API_BASE = 'http://localhost:8000';

// Custom Heatmap component to wrap Leaflet.heat
const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!points || !points.length) return;
        const heatPoints = points.map(p => [p.lat, p.lon, 1.0]);
        const layer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);
        return () => map.removeLayer(layer);
    }, [map, points]);
    return null;
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [globalStats, setGlobalStats] = useState(null);

    const loadData = async () => {
        try {
            const [statsRes, heatmapRes, globalRes] = await Promise.all([
                axios.get(`${API_BASE}/analytics/stats`),
                axios.get(`${API_BASE}/analytics/heatmap-data`),
                axios.get(`${API_BASE}/trends/stats`)
            ]);
            setStats(statsRes.data);
            setHeatmapData(heatmapRes.data.points);
            setGlobalStats(globalRes.data);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!stats || !globalStats) {
        return (
            <div className="text-center py-5 mt-5">
                <div className="spinner-border text-accent mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <h5>Loading Dashboard Intelligence...</h5>
            </div>
        );
    }

    const pieData = {
        labels: stats.result_distribution?.map(d => d.result) || [],
        datasets: [{
            data: stats.result_distribution?.map(d => d.count) || [],
            backgroundColor: ['#dc3545', '#198754'],
            borderWidth: 0
        }]
    };

    const sortedDaily = [...(stats.daily_counts || [])].reverse();
    const lineData = {
        labels: sortedDaily.map(d => d.date),
        datasets: [{
            label: 'Scans Processed',
            data: sortedDaily.map(d => d.count),
            borderColor: '#00d2ff',
            backgroundColor: 'rgba(0, 210, 255, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const barData = {
        labels: stats.top_countries?.map(d => d.country) || [],
        datasets: [{
            label: 'Scans by Country',
            data: stats.top_countries?.map(d => d.count) || [],
            backgroundColor: '#00d2ff'
        }]
    };

    const globalBarData = {
        labels: globalStats.by_region?.map(r => r.region) || [],
        datasets: [
            {
                label: 'New Cases',
                data: globalStats.by_region?.map(r => r.new_cases) || [],
                backgroundColor: 'rgba(0, 210, 255, 0.7)'
            },
            {
                label: 'Deaths',
                data: globalStats.by_region?.map(r => r.deaths) || [],
                backgroundColor: 'rgba(220, 53, 69, 0.7)'
            }
        ]
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold"><i className="bi bi-grid-1x2 text-accent"></i> Intelligence <span className="text-accent">Dashboard</span></h3>
                <button className="btn btn-outline-light btn-sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Total Scans</h6>
                        <h2 className="mb-0 fw-bold">{stats.total_scans?.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Tumors Detected</h6>
                        <h2 className="mb-0 fw-bold text-danger">{stats.tumors_detected?.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Clear Scans</h6>
                        <h2 className="mb-0 fw-bold text-success">{stats.no_tumors?.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Detection Rate</h6>
                        <h2 className="mb-0 fw-bold text-accent">{stats.tumor_rate}%</h2>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Total Interactions</h6>
                        <h2 className="mb-0 fw-bold">{stats.interaction_summary?.total?.toLocaleString?.() ?? 0}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Top Event</h6>
                        <h2 className="mb-0 fw-bold text-accent" style={{ fontSize: '1.35rem' }}>
                            {stats.interaction_summary?.by_event?.[0]?.event_type || 'N/A'}
                        </h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card card-glass text-center p-3 h-100">
                        <h6 className="text-muted text-uppercase small">Most Active Page</h6>
                        <h2 className="mb-0 fw-bold text-accent" style={{ fontSize: '1.35rem' }}>
                            {stats.interaction_summary?.by_page?.[0]?.page || 'N/A'}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="card card-glass mb-4">
                <div className="card-body">
                    <h5 className="card-title fw-bold">Live Scan Origins (Heatmap)</h5>
                    <div style={{ height: '400px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                            />
                            <HeatmapLayer points={heatmapData} />
                        </MapContainer>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-4">
                    <div className="card card-glass h-100">
                        <div className="card-body text-center">
                            <h6 className="fw-bold mb-4">Result Distribution</h6>
                            <div style={{ height: '250px' }} className="d-flex justify-content-center">
                                <Doughnut data={pieData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card card-glass h-100">
                        <div className="card-body">
                            <h6 className="fw-bold mb-4">Scans Processed Over Time (30 Days)</h6>
                            <div style={{ height: '250px' }}>
                                <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card card-glass h-100">
                        <div className="card-body">
                            <h6 className="fw-bold mb-4">Top 10 Active Countries</h6>
                            <div style={{ height: '300px' }}>
                                <Bar data={barData} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card card-glass h-100">
                        <div className="card-body">
                            <h6 className="fw-bold mb-4">Global Brain Tumor Incidence (WHO GLOBOCAN Data)</h6>
                            <div style={{ height: '300px' }}>
                                <Bar data={globalBarData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
