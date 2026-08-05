import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorComponent = ({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred while loading digital library resources.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card rounded-2xl border border-rose-200 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-lg shadow-rose-500/10">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 border border-gray-300 text-sm font-medium transition-all duration-200 hover:border-blue-300 cursor-pointer"
        >
          <RefreshCw size={16} className="text-blue-600" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;
