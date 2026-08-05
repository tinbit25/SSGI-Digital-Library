import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear, placeholder = 'Search resources by title, author, or keyword...' }) => {
  return (
    <div className="relative w-full max-w-lg">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-800 placeholder-gray-400 text-xs rounded-2xl pl-11 pr-10 py-3 border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
