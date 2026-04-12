import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);
ChartJS.defaults.color = '#6B6B6B';
ChartJS.defaults.borderColor = '#E8E4DF';

const API_BASE = 'https://brain-tumor-project-main.vercel.app';

/* ── Heatmap Layer ──────────────────────────── */
const HeatmapLayer = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (!points?.length) return;
        const layer = L.heatLayer(
            points.map(p => [p.lat, p.lon, 1.0]),
            { radius: 28, blur: 18, maxZoom: 10, gradient: { 0.2: '#3b82f6', 0.45: '#10b981', 0.65: '#f59e0b', 0.85: '#f43f5e', 1: '#fff' } }
        ).addTo(map);
        return () => map.removeLayer(layer);
    }, [map, points]);
    return null;
};

/* ── Stat Card ──────────────────────────────── */
const StatCard = ({ icon, label, value, color, suffix }) => (
    <div className="stat-card reveal">
        <div className={`stat-icon ${color}`}><i className={`bi ${icon}`}></i></div>
        <div className="stat-value">{value ?? '—'}{suffix && <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: 2 }}>{suffix}</span>}</div>
        <div className="stat-label">{label}</div>
    </div>
);

/* ── Chart Wrapper ──────────────────────────── */
const ChartCard = ({ title, badge, children, minH = 270 }) => (
    <div className="chart-card" style={{ height: '100%' }}>
        <div className="chart-card-header">
            <h6 className="chart-card-title">{title}</h6>
            {badge && <span className="chart-card-badge">{badge}</span>}
        </div>
        <div className="chart-card-body" style={{ minHeight: minH }}>
            {children}
        </div>
    </div>
);

/* ── Main Dashboard ─────────────────────────── */
function Dashboard() {
    const [stats, setStats] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [globalStats, setGlobalStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const [s, h, g] = await Promise.all([
                axios.get(`${API_BASE}/analytics/stats`),
                axios.get(`${API_BASE}/analytics/heatmap-data`),
                axios.get(`${API_BASE}/trends/stats`),
            ]);
            setStats(s.data);
            setHeatmapData(h.data.points);
            setGlobalStats(g.data);
        } catch (err) { console.error('Dashboard load error:', err); }
        finally { setRefreshing(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    if (!stats || !globalStats) {
        return (
            <div style={{ textAlign: 'center', padding: '8rem 0' }}>
                <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
                <h6 style={{ fontWeight: 600 }}>Loading Dashboard&hellip;</h6>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fetching analytics, trends and heatmap data</p>
            </div>
        );
    }

    /* ─ Chart configs ─ */
    const chartFont = { family: "'Inter', sans-serif" };
    const gridColor = '#F2EDE8';
    const tooltipStyle = { backgroundColor: '#1A1A1A', titleColor: '#fff', bodyColor: '#e2e8f0', titleFont: chartFont, bodyFont: chartFont, borderWidth: 0, padding: 10, cornerRadius: 8 };

    const sortedDaily = [...(stats.daily_counts || [])].reverse();
    const lineData = {
        labels: sortedDaily.map(d => d.date),
        datasets: [{
            label: 'Scans', data: sortedDaily.map(d => d.count),
            borderColor: '#E63E21', backgroundColor: 'rgba(230, 62, 33, 0.08)',
            fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#E63E21', borderWidth: 2,
        }],
    };
    const lineOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tooltipStyle },
        scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 7, font: { ...chartFont, size: 11 } } }, y: { grid: { color: gridColor }, ticks: { font: { ...chartFont, size: 11 } }, beginAtZero: true } },
    };

    const doughnutData = {
        labels: stats.result_distribution?.map(d => d.result) || [],
        datasets: [{ data: stats.result_distribution?.map(d => d.count) || [], backgroundColor: ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b'], borderWidth: 0, hoverOffset: 6 }],
    };
    const doughnutOpts = {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { ...chartFont, size: 11 } } }, tooltip: tooltipStyle },
    };

    const barData = {
        labels: stats.top_countries?.map(d => d.country) || [],
        datasets: [{ label: 'Scans', data: stats.top_countries?.map(d => d.count) || [], backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 6, borderSkipped: false, barThickness: 18 }],
    };
    const barOpts = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: tooltipStyle },
        scales: { x: { grid: { color: gridColor }, ticks: { font: { ...chartFont, size: 11 } }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { ...chartFont, size: 11 } } } },
    };

    const globalBarData = {
        labels: globalStats.by_region?.map(r => r.region) || [],
        datasets: [
            { label: 'New Cases', data: globalStats.by_region?.map(r => r.new_cases) || [], backgroundColor: 'rgba(59,130,246,0.55)', borderRadius: 4, barPercentage: 0.7 },
            { label: 'Deaths', data: globalStats.by_region?.map(r => r.deaths) || [], backgroundColor: 'rgba(244,63,94,0.55)', borderRadius: 4, barPercentage: 0.7 },
        ],
    };
    const globalBarOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'end', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { ...chartFont, size: 11 } } }, tooltip: tooltipStyle },
        scales: { x: { grid: { display: false }, ticks: { font: { ...chartFont, size: 10 }, maxRotation: 45, minRotation: 25 } }, y: { grid: { color: gridColor }, ticks: { font: { ...chartFont, size: 11 } }, beginAtZero: true } },
    };

    return (
        <div>
            {/* ── Page Hero ────────────────────── */}
            <div className="page-hero">
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                        <h1>Intelligence Dashboard</h1>
                        <p>Real-time analytics, AI scan metrics, and global health trends</p>
                    </div>
                    <button className="btn-secondary-custom btn-sm-custom" onClick={loadData} disabled={refreshing}>
                        <i className={`bi bi-arrow-clockwise${refreshing ? ' spin' : ''}`}></i> Refresh
                    </button>
                </div>
            </div>

            <div className="container">
                {/* ── KPI Row ──────────────────────── */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-lg-3"><StatCard icon="bi-clipboard2-pulse" label="Total Scans" value={stats.total_scans?.toLocaleString()} color="green" /></div>
                    <div className="col-6 col-lg-3"><StatCard icon="bi-exclamation-diamond" label="Tumors Detected" value={stats.tumors_detected?.toLocaleString()} color="rose" /></div>
                    <div className="col-6 col-lg-3"><StatCard icon="bi-shield-check" label="Clear Scans" value={stats.no_tumors?.toLocaleString()} color="blue" /></div>
                    <div className="col-6 col-lg-3"><StatCard icon="bi-percent" label="Detection Rate" value={stats.tumor_rate} color="amber" suffix="%" /></div>
                </div>

                {/* ── Interaction KPIs ─────────────── */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4"><StatCard icon="bi-cursor" label="Total Interactions" value={stats.interaction_summary?.total?.toLocaleString?.() ?? 0} color="purple" /></div>
                    <div className="col-md-4">
                        <div className="stat-card reveal">
                            <div className="stat-icon green"><i className="bi bi-lightning-charge"></i></div>
                            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{stats.interaction_summary?.by_event?.[0]?.event_type || 'N/A'}</div>
                            <div className="stat-label">Top Event Type</div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card reveal">
                            <div className="stat-icon blue"><i className="bi bi-window-stack"></i></div>
                            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{stats.interaction_summary?.by_page?.[0]?.page || 'N/A'}</div>
                            <div className="stat-label">Most Active Page</div>
                        </div>
                    </div>
                </div>

                {/* ── Scan Trend + Doughnut ────────── */}
                <div className="row g-4 mb-4">
                    <div className="col-lg-8 reveal">
                        <ChartCard title="Scan Volume" badge="Last 30 days">
                            <Line data={lineData} options={lineOpts} />
                        </ChartCard>
                    </div>
                    <div className="col-lg-4 reveal reveal-delay-1">
                        <ChartCard title="Result Distribution">
                            <Doughnut data={doughnutData} options={doughnutOpts} />
                        </ChartCard>
                    </div>
                </div>

                {/* ── Heatmap ──────────────────────── */}
                <div className="chart-card mb-4 reveal">
                    <div className="chart-card-header">
                        <h6 className="chart-card-title">Live Scan Origins</h6>
                        <span className="chart-card-badge"><i className="bi bi-geo-alt" style={{ marginRight: 4 }}></i>Heatmap</span>
                    </div>
                    <div className="chart-card-body" style={{ padding: 0 }}>
                        <div className="map-container" style={{ height: 380, borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
                            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &amp; CARTO" />
                                <HeatmapLayer points={heatmapData} />
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* ── Country Bar + WHO GLOBOCAN ──── */}
                <div className="row g-4" style={{ marginBottom: '2rem' }}>
                    <div className="col-lg-4 reveal">
                        <ChartCard title="Top Countries" badge="By scan count" minH={300}>
                            <Bar data={barData} options={barOpts} />
                        </ChartCard>
                    </div>
                    <div className="col-lg-8 reveal reveal-delay-1">
                        <ChartCard title="Global Brain Tumor Incidence" badge="WHO GLOBOCAN" minH={300}>
                            <Bar data={globalBarData} options={globalBarOpts} />
                        </ChartCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
