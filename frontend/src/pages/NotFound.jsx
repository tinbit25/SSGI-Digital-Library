import React from 'react';
import { Link } from 'react-router-dom';
import { Satellite, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

    <div className="relative z-10 max-w-md space-y-6">
      {/* Animated satellite icon */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xl shadow-blue-500/10 animate-pulse">
        <Satellite size={40} />
      </div>

      <div className="space-y-2">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 select-none">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          The SSGI Digital Library portal could not locate this page. The resource may have been archived, moved, or the URL is incorrect.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl ssgi-gradient-bg text-white font-semibold text-sm shadow-xl shadow-blue-500/20 hover:brightness-110 transition-all"
        >
          <Home size={16} />
          Return to Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFound;
