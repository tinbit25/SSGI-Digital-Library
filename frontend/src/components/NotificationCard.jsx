import React from 'react';
import { Bell, BookOpen, Sparkles, CheckCircle2, Clock } from 'lucide-react';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const {
    id,
    title,
    message,
    created_at = 'Recently',
    read_at = null,
    is_read = false,
    type = 'system',
  } = notification;

  const isReadState = Boolean(is_read || read_at);

  const getIcon = (notifType) => {
    switch (notifType?.toLowerCase()) {
      case 'resource':
      case 'new_resource':
        return <BookOpen size={20} className="text-blue-600" />;
      case 'ai':
      case 'rag':
        return <Sparkles size={20} className="text-indigo-600" />;
      case 'system':
      default:
        return <Bell size={20} className="text-emerald-600" />;
    }
  };

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border transition-all ${
        !isReadState
          ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-500/5'
          : 'border-gray-200 opacity-80'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon Container */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            !isReadState
              ? 'bg-white border border-gray-300 shadow-inner'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          {getIcon(type)}
        </div>

        {/* Notification Content Body */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              {!isReadState && (
                <span className="w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-500/20" title="Unread" />
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 flex-shrink-0">
              <Clock size={12} />
              {created_at}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

          <div className="pt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">
              Status: <strong className={!isReadState ? 'text-blue-600' : 'text-slate-400'}>
                {!isReadState ? 'Unread' : 'Read'}
              </strong>
            </span>

            {!isReadState && onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(id)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 size={12} />
                <span>Mark as Read</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
