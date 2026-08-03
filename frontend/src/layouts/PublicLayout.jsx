import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { SYSTEM_INFO } from '../utils/constants';
import { Shield, Sparkles, BookOpen } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Orbital Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-sky-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-bold text-sky-400">
              SSGI
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
              {SYSTEM_INFO.ABBREVIATION} <span className="ssgi-gradient-text">Digital Library</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Space Science & Geospatial Institute</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="hidden sm:flex items-center gap-1.5 text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            <Shield size={12} /> Read-Only Repository System
          </span>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
