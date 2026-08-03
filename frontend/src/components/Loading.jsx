import React from 'react';

const Loading = ({ message = 'Loading SSGI Library System...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <div className="relative w-16 h-16 mb-4">
        {/* Outer glowing orbital ring */}
        <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping"></div>
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-sky-400 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin"></div>
        {/* Center core */}
        <div className="absolute inset-3 rounded-full bg-slate-900 border border-sky-400/30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></div>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;
