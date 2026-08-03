import React from 'react';
import { Tag, Clock, User, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const FeedbackCard = ({ item }) => {
  const {
    id,
    subject,
    message,
    user_name = 'SSGI User',
    user_email,
    type = 'missing_resource',
    status = 'pending',
    created_at = 'Recently',
  } = item;

  const getStatusBadge = (statusState) => {
    switch (statusState?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'reviewed':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'pending':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getTypeLabel = (typeKey) => {
    switch (typeKey) {
      case 'missing_resource':
        return 'Missing Resource';
      case 'problem':
        return 'Problem / Bug';
      case 'suggestion':
        return 'Suggestion';
      case 'improvement':
        return 'Improvement';
      default:
        return 'General Feedback';
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
              {getTypeLabel(type)}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(status)}`}>
              {status}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">{subject}</h4>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        {message}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5 font-medium">
          <User size={12} className="text-sky-400" />
          <span>{user_name}</span>
          {user_email && <span className="text-slate-500">({user_email})</span>}
        </div>
        <div className="flex items-center gap-1 font-mono text-slate-500">
          <Clock size={12} />
          <span>{created_at}</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
