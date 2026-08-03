import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorComponent = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred while loading digital library resources.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl border border-rose-500/20 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-sm font-medium transition-all duration-200 hover:border-sky-500/50 cursor-pointer"
        >
          <RefreshCw size={16} className="text-sky-400" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
