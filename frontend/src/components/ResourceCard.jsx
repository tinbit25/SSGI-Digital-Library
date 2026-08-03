import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Tag, Lock, FileText, Eye, Sparkles } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    author,
    category,
    type = 'Research Paper',
    cover_image,
    pages,
    year = '2024',
  } = resource;

  const getTypeBadgeColor = (resourceType) => {
    switch (resourceType?.toLowerCase()) {
      case 'book':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'training material':
      case 'training':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'technical document':
      case 'technical':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'research paper':
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg">
      {/* Top Cover Image / Graphic Banner */}
      <div className="relative h-44 w-full bg-white overflow-hidden flex items-center justify-center border-b border-gray-200">
        {cover_image && !imageError ? (
          <img
            src={cover_image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Custom Orbital Gradient Cover Placeholder */
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex flex-col items-center justify-center p-6 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2 shadow-lg shadow-blue-500/10">
              <BookOpen size={24} />
            </div>
            <span className="text-[11px] font-mono text-slate-500 tracking-widest uppercase">SSGI LIBRARY</span>
          </div>
        )}

        {/* Read-Only Badge Overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-[10px] font-medium text-slate-600 flex items-center gap-1 shadow-md">
          <Lock size={10} className="text-emerald-600" />
          <span>Read-Only</span>
        </div>

        {/* Resource Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getTypeBadgeColor(type)}`}>
            {type}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category Tag */}
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
            <Tag size={12} />
            <span>{typeof category === 'object' ? category?.name : category || 'Geospatial Resource'}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-500 font-medium truncate">
            By {author || 'SSGI Research Directorate'} {year && `(${year})`}
          </p>
        </div>

        {/* Action Button Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">{pages ? `${pages} Pages` : 'Online Document'}</span>

          <Link
            to={`/resources/${id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-blue-600 text-slate-700 hover:text-slate-900 border border-gray-300 hover:border-blue-500 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Eye size={14} />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
