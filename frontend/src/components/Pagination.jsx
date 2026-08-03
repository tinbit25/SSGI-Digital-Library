import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200 text-xs">
      <p className="text-slate-500 font-medium">
        Page <span className="text-slate-800 font-bold">{currentPage}</span> of{' '}
        <span className="text-slate-800 font-bold">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
