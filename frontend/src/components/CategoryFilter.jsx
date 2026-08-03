import React from 'react';
import { Filter, Tag } from 'lucide-react';

const CategoryFilter = ({ categories = [], selectedCategory = null, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap pr-1">
        <Filter size={14} className="text-sky-400" />
        <span>Categories:</span>
      </span>

      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
          selectedCategory === null
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
        }`}
      >
        All Categories
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;
        return (
          <button
            key={cat.id || cat.name}
            onClick={() => onSelectCategory(cat.id || cat.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              isSelected
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
            }`}
          >
            <Tag size={12} className={isSelected ? 'text-sky-400' : 'text-slate-500'} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
