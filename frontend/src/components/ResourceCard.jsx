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
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'training material':
      case 'training':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'technical document':
      case 'technical':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'research paper':
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800/80 hover:border-sky-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg">
      {/* Top Cover Image / Graphic Banner */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-800/80">
        {cover_image && !imageError ? (
          <img
            src={cover_image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Custom Orbital Gradient Cover Placeholder */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 flex flex-col items-center justify-center p-6 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2 shadow-lg shadow-sky-500/10">
              <BookOpen size={24} />
            </div>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest uppercase">SSGI LIBRARY</span>
          </div>
        )}

        {/* Read-Only Badge Overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-medium text-slate-300 flex items-center gap-1 shadow-md">
          <Lock size={10} className="text-emerald-400" />
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
          <div className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
            <Tag size={12} />
            <span>{typeof category === 'object' ? category?.name : category || 'Geospatial Resource'}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-400 font-medium truncate">
            By {author || 'SSGI Research Directorate'} {year && `(${year})`}
          </p>
        </div>

        {/* Action Button Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">{pages ? `${pages} Pages` : 'Online Document'}</span>

          <Link
            to={`/resources/${id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-500 text-xs font-semibold transition-all cursor-pointer shadow-sm"
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
