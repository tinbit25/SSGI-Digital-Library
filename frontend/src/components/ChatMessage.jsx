import React from 'react';
import { Bot, User, BookOpen, Sparkles, AlertCircle, Clock } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { sender, text, sources = [], isError = false, timestamp } = message;
  const isAI = sender === 'ai';

  return (
    <div className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Avatar (left side) */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5 shadow-md">
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
                ? 'bg-rose-50 border border-rose-200 text-rose-600 rounded-tl-none'
                : 'glass-card border border-gray-200 text-slate-800 rounded-tl-none'
              : 'ssgi-gradient-bg text-white rounded-tr-none shadow-lg shadow-blue-500/15'
          }`}
        >
          {isError && (
            <div className="flex items-center gap-2 mb-2 text-rose-600">
              <AlertCircle size={14} />
              <span className="font-semibold">Response Error</span>
            </div>
          )}

          {isAI && !isError && (
            <div className="flex items-center gap-1.5 mb-2 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={11} />
              <span>AI Library Assistant</span>
            </div>
          )}

          <p className="whitespace-pre-line">{text}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono px-1">
            <Clock size={10} />
            {timestamp}
          </span>
        )}

        {/* RAG Source Citations — only on AI responses */}
        {isAI && sources.length > 0 && (
          <div className="w-full p-3 rounded-xl bg-white border border-gray-200 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
              <BookOpen size={11} />
              Retrieved Document Sources ({sources.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-[11px]"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-800 truncate">{src.title || src.document}</p>
                    <p className="text-slate-500">{src.page || src.chunk_ref}</p>
                  </div>
                  {(src.relevance || src.score) && (
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap flex-shrink-0">
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
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 shadow-md">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
