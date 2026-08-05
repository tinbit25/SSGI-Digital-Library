import React from 'react';
import { Filter, Tag } from 'lucide-react';

const CategoryFilter = ({ categories = [], selectedCategory = null, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 whitespace-nowrap pr-1">
        <Filter size={14} className="text-blue-600" />
        <span>Categories:</span>
      </span>

      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
          selectedCategory === null
            ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100 border border-gray-200'
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
                ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Tag size={12} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
