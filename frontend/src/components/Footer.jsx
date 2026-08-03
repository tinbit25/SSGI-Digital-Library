import React from 'react';
import { ShieldCheck, Lock, Globe } from 'lucide-react';
import { SYSTEM_INFO } from '../utils/constants';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-900/40 backdrop-blur-md text-slate-500 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            SSGI
          </div>
          <div>
            <p className="font-medium text-slate-600">{SYSTEM_INFO.INSTITUTION}</p>
            <p className="text-slate-400 text-[11px]">Digital Resource Repository & Repository Security Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
            <Lock size={12} />
            Protected Read-Only System
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors">
            <ShieldCheck size={14} className="text-blue-600" />
            Zero-Download Enforcement
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors">
            <Globe size={14} className="text-indigo-600" />
            v{SYSTEM_INFO.VERSION}
          </span>
        </div>

        <div className="text-slate-400 text-[11px]">
          &copy; {new Date().getFullYear()} Ethiopian Space Science and Geospatial Institute. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
