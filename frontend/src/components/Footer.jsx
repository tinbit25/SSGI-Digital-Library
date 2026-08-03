import React from 'react';
import { ShieldCheck, Lock, Globe } from 'lucide-react';
import { SYSTEM_INFO } from '../utils/constants';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-400 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            SSGI
          </div>
          <div>
            <p className="font-medium text-slate-300">{SYSTEM_INFO.INSTITUTION}</p>
            <p className="text-slate-500 text-[11px]">Digital Resource Repository & Repository Security Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[11px]">
            <Lock size={12} />
            Protected Read-Only System
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <ShieldCheck size={14} className="text-sky-400" />
            Zero-Download Enforcement
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
            <Globe size={14} className="text-indigo-400" />
            v{SYSTEM_INFO.VERSION}
          </span>
        </div>

        <div className="text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Ethiopian Space Science and Geospatial Institute. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
