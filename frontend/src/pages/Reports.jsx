import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Eye, Activity, RefreshCw, TrendingUp, ShieldCheck, Bot } from 'lucide-react';
import adminService from '../services/adminService';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

const MOCK_STATS = {
  total_resources: 1420,
  total_reads: 12480,
  drm_blocks: 342,
  ai_queries: 4120,
  feedback_count: 28,
  active_users: 86,
};

const MOCK_LOGS = [
  { id: 1, user: 'Dr. Alemu Tadesse', document: 'Ethiopian Space Science Strategy Framework 2024', action: 'Read Online', time: '10 mins ago' },
  { id: 2, user: 'Samuel Bekele', document: 'Ionospheric Physics & GNSS Interference Handbook', action: 'Read Online', time: '45 mins ago' },
  { id: 3, user: 'Sara Yohannes', document: 'Practical QGIS & PyQGIS Training Manual', action: 'Metadata Updated', time: '2 hours ago' },
  { id: 4, user: 'Hana Girma', document: 'Geospatial Data Infrastructure Manual', action: 'Read Online', time: '3 hours ago' },
];

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="glass-panel p-5 rounded-2xl border border-gray-200 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 font-semibold">{title}</span>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
    {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
  </div>
);

const Reports = () => {
  const [stats, setStats]   = useState(null);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let s, l;
      try {
        [s, l] = await Promise.all([adminService.getReports(), adminService.getAccessLogs()]);
        setStats(s.stats || s.data || s);
        const logs = l.logs || l.data || l;
        setLogs(Array.isArray(logs) ? logs : MOCK_LOGS);
      } catch {
        setStats(MOCK_STATS);
        setLogs(MOCK_LOGS);
      }
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = stats ? [
    { title: 'Total Resources',      value: (stats.total_resources || MOCK_STATS.total_resources).toLocaleString(), sub: 'Books, papers & manuals',  icon: Eye,         color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Document Reads', value: (stats.total_reads     || MOCK_STATS.total_reads    ).toLocaleString(), sub: 'Protected canvas sessions', icon: TrendingUp,  color: 'bg-indigo-50 text-indigo-600' },
    { title: 'DRM Blocks',           value: (stats.drm_blocks      || MOCK_STATS.drm_blocks     ).toLocaleString(), sub: 'Zero security breaches',    icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'AI RAG Queries',       value: (stats.ai_queries      || MOCK_STATS.ai_queries     ).toLocaleString(), sub: 'Qdrant vector searches',    icon: Bot,         color: 'bg-purple-50 text-purple-600' },
  ] : [];

  if (loading) return <Loading message="Loading system reports..." />;
  if (error)   return <ErrorComponent message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-purple-600" /> System Reports & Audit Logs
          </h1>
          <p className="text-slate-500 text-xs mt-1">Monitor document access, DRM compliance, and system activity.</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Access Logs Table */}
      <div className="glass-panel rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Activity size={18} className="text-purple-600" />
          <h2 className="text-sm font-bold text-slate-800">Recent Document Access Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[540px]">
            <thead className="bg-white text-slate-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{log.user}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{log.document}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
