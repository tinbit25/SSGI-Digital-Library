import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Bot, 
  Sparkles, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  FolderKanban,
  FileCheck,
  Search
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Digital Resources', value: '1,420+', label: 'Books, Papers & Manuals', icon: BookOpen, color: 'from-sky-500 to-blue-600' },
    { title: 'AI Vectors Indexed', value: '84,500', label: 'Qdrant Chunks Ready', icon: Bot, color: 'from-indigo-500 to-purple-600' },
    { title: 'Categories', value: '18', label: 'Geospatial & Space Science', icon: FolderKanban, color: 'from-purple-500 to-pink-600' },
    { title: 'Security Standard', value: 'Protected', label: 'Zero-Download DRM Active', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold">
              <Sparkles size={14} className="text-sky-400" />
              <span>SSGI Digital Library System v1.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, <span className="ssgi-gradient-text">{user?.name || 'Researcher'}</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Explore geospatial datasets, remote sensing literature, space physics research, and training materials. All document access is online and protected.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl ssgi-gradient-bg text-white font-semibold text-xs shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all"
            >
              <Search size={16} />
              <span>Explore Library</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs transition-all"
            >
              <Bot size={16} />
              <span>Launch AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stat.color} p-[1px]`}>
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-slate-200">
                    <IconComp size={18} />
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Featured Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Quick Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Tiles */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen size={20} className="text-sky-400" />
                Featured Resource Categories
              </h2>
              <Link to="/resources" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Satellite Remote Sensing', count: '340 Papers', desc: 'Optical, SAR & Thermal imagery analysis guides.' },
                { title: 'Geospatial Analytics & GIS', count: '412 Manuals', desc: 'QGIS, ArcGIS Pro, Spatial statistics tutorials.' },
                { title: 'Space Physics & Astronomy', count: '289 Documents', desc: 'Ionosphere studies, space weather & astrophysics.' },
                { title: 'Geodesy & Geodynamics', count: '195 Reports', desc: 'GNSS reference frames & geodetic data manuals.' },
              ].map((cat, idx) => (
                <Link
                  key={idx}
                  to={`/resources?category=${encodeURIComponent(cat.title)}`}
                  className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-sky-500/30 transition-all group block"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">{cat.title}</h3>
                    <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">{cat.count}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Librarian / Admin Quick Actions */}
          {(user?.role === ROLES.LIBRARIAN || user?.role === ROLES.ADMIN) && (
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Role Management Hub ({user.role})
                </span>
                <span className="text-[10px] text-emerald-300/80">Authorized Access</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                As a {user.role}, you can upload new resources, process Qdrant vector chunks, review user feedback, and dispatch institute notifications.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/resources" className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                  Upload & Categorize Documents
                </Link>
                <Link to="/feedback" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors">
                  Review User Feedback
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: AI RAG Assistant Highlight Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-transparent relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">AI Library Assistant</h3>
                <p className="text-[11px] text-indigo-300 font-medium">Powered by Qdrant RAG</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ask questions directly to our institutional AI assistant. It analyzes uploaded documents and returns precise answers with exact page citations.
            </p>

            <div className="space-y-2 mb-6">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                "Summarize Ethiopian satellite calibration data from 2024."
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                "Find training documents for QGIS Python Scripting."
              </div>
            </div>

            <Link
              to="/ai-assistant"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles size={16} />
              <span>Ask AI Assistant Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
