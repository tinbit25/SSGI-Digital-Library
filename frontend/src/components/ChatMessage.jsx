import React from 'react';
import { Bot, User, BookOpen, Sparkles, AlertCircle, Clock } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { sender, text, sources = [], isError = false, timestamp } = message;
  const isAI = sender === 'ai';

  return (
    <div className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Avatar (left side) */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-0.5 shadow-md">
          <Bot size={18} />
        </div>
      )}

      {/* Message Bubble + Sources */}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isAI ? 'items-start' : 'items-end'}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
            isAI
              ? isError
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-none'
                : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none'
              : 'ssgi-gradient-bg text-white rounded-tr-none shadow-lg shadow-sky-500/15'
          }`}
        >
          {isError && (
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <AlertCircle size={14} />
              <span className="font-semibold">Response Error</span>
            </div>
          )}

          {isAI && !isError && (
            <div className="flex items-center gap-1.5 mb-2 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={11} />
              <span>AI Library Assistant</span>
            </div>
          )}

          <p className="whitespace-pre-line">{text}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono px-1">
            <Clock size={10} />
            {timestamp}
          </span>
        )}

        {/* RAG Source Citations — only on AI responses */}
        {isAI && sources.length > 0 && (
          <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              <BookOpen size={11} />
              Retrieved Document Sources ({sources.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px]"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-200 truncate">{src.title || src.document}</p>
                    <p className="text-slate-400">{src.page || src.chunk_ref}</p>
                  </div>
                  {(src.relevance || src.score) && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap flex-shrink-0">
                      {src.relevance || `${Math.round((src.score || 0) * 100)}%`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar (right side) */}
      {!isAI && (
        <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 flex-shrink-0 mt-0.5 shadow-md">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
