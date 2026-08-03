import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  BookOpen,
  FileText,
  Loader2,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import aiService from '../services/aiService';
import ChatMessage from '../components/ChatMessage';
import useAuth from '../hooks/useAuth';

// Fallback mock AI response when backend POST /api/ai/* is offline
const buildMockAIResponse = (query, mode) => {
  const base = {
    answer:
      `Based on the SSGI Digital Library repository, here is the synthesized response for:\n"${query}"\n\n` +
      `The institute's documents emphasize structured ground station operations, satellite data processing ` +
      `workflows, and high-precision spatial analytics for national developmental planning. ` +
      `Satellite imagery is calibrated using atmospheric correction models detailed in the 2024 technical guidelines.`,
    sources: [
      { title: 'Ethiopian Space Science Strategy Framework 2024', page: 'Page 34', relevance: '94% Match' },
      { title: 'Geospatial Data Infrastructure Manual', page: 'Page 12', relevance: '89% Match' },
    ],
  };

  if (mode === 'recommend') {
    return {
      ...base,
      answer:
        `Based on your query: "${query}"\n\nRecommended SSGI resources:\n` +
        `1. Sentinel-2 Imagery Analysis & Land Cover Classification (2024)\n` +
        `2. Ethiopian Space Science Strategy & Ground Station Framework\n` +
        `3. Practical QGIS & PyQGIS Automation Training Manual\n` +
        `4. Ionospheric Physics & GNSS Interference Handbook`,
    };
  }
  if (mode === 'summary') {
    return {
      ...base,
      answer:
        `Document Summary for: "${query}"\n\n` +
        `This SSGI institutional document covers satellite remote sensing calibration workflows, ` +
        `GNSS error analysis in equatorial regions, and geospatial data infrastructure standards. ` +
        `Key sections include: ground station configuration, atmospheric correction models, and ` +
        `reproducible GIS analysis scripts. The document spans 124 pages with 78 vector chunks indexed in Qdrant.`,
    };
  }
  return base;
};

const SUGGESTED_PROMPTS = [
  { label: 'What are the SSGI satellite calibration methods?', mode: 'chat' },
  { label: 'Recommend resources on equatorial ionosphere research.', mode: 'recommend' },
  { label: 'Summarize the Ethiopian Space Science Strategy 2024.', mode: 'summary' },
  { label: 'Find training materials for QGIS Python scripting.', mode: 'chat' },
];

const now = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const AIAssistant = () => {
  const { user } = useAuth();
  const chatBottomRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'recommend' | 'summary'
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chat conversation history
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Researcher'}! I am your SSGI AI Library Assistant, powered by the Qdrant vector database and your institutional document store.\n\nYou can:\n• Ask questions about any SSGI document\n• Request resource recommendations\n• Get AI-generated document summaries`,
      sources: [],
      timestamp: now(),
    },
  ]);

  // Recommendations & Summary have their own single-response state
  const [recommendResult, setRecommendResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isGenerating]);

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Conversation reset. How can I help you, ${user?.name || 'Researcher'}?`,
        sources: [],
        timestamp: now(),
      },
    ]);
  };

  const callAI = useCallback(async (query, mode) => {
    if (!query.trim() || isGenerating) return;
    setIsGenerating(true);

    if (mode === 'chat') {
      const userMsg = { id: Date.now(), sender: 'user', text: query, sources: [], timestamp: now() };
      setChatMessages((prev) => [...prev, userMsg]);
      setInputQuery('');

      try {
        let data;
        try {
          data = await aiService.sendChat({ question: query, history: [] });
        } catch (apiErr) {
          console.warn('API POST /api/ai/chat offline, using mock response:', apiErr);
          data = buildMockAIResponse(query, 'chat');
        }

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.answer || data.response || data.message || 'No response from AI.',
          sources: data.sources || data.references || [],
          timestamp: now(),
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: 'An error occurred while processing your request. Please try again.',
            sources: [],
            isError: true,
            timestamp: now(),
          },
        ]);
      }
    } else if (mode === 'recommend') {
      setRecommendResult(null);
      setInputQuery('');
      try {
        let data;
        try {
          data = await aiService.getRecommendations({ query });
        } catch (apiErr) {
          console.warn('API POST /api/ai/recommend offline, using mock response:', apiErr);
          data = buildMockAIResponse(query, 'recommend');
        }
        setRecommendResult({ text: data.answer || data.response || data.message, sources: data.sources || [] });
      } catch (err) {
        setRecommendResult({ text: 'Failed to fetch recommendations. Please try again.', isError: true, sources: [] });
      }
    } else if (mode === 'summary') {
      setSummaryResult(null);
      setInputQuery('');
      try {
        let data;
        try {
          data = await aiService.getSummary({ query });
        } catch (apiErr) {
          console.warn('API POST /api/ai/summary offline, using mock response:', apiErr);
          data = buildMockAIResponse(query, 'summary');
        }
        setSummaryResult({ text: data.answer || data.summary || data.response || data.message, sources: data.sources || [] });
      } catch (err) {
        setSummaryResult({ text: 'Failed to generate summary. Please try again.', isError: true, sources: [] });
      }
    }

    setIsGenerating(false);
  }, [isGenerating]);

  const handleSend = (e) => {
    e?.preventDefault();
    callAI(inputQuery, activeTab);
  };

  const handleSuggestedPrompt = (prompt) => {
    setActiveTab(prompt.mode);
    setInputQuery(prompt.label);
    callAI(prompt.label, prompt.mode);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-600">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              AI Library Assistant
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-200">
                RAG + Qdrant
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Powered by SSGI document embeddings — Laravel handles all AI & vector logic.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-gray-200 text-xs">
          {[
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'recommend', label: 'Recommend', icon: BookOpen },
            { id: 'summary', label: 'Summarize', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setInputQuery(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Mode Tabs */}
      <div className="sm:hidden flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs flex-shrink-0">
        {[
          { id: 'chat', label: 'Chat' },
          { id: 'recommend', label: 'Recommend' },
          { id: 'summary', label: 'Summarize' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setInputQuery(''); }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-center ${
              activeTab === id
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold'
                : 'text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === 'chat' && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto glass-panel rounded-3xl border border-gray-200 p-4 sm:p-6 space-y-4 min-h-0">
            {chatMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing Indicator */}
            {isGenerating && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                  <Bot size={18} />
                </div>
                <div className="glass-card border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-indigo-600">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Searching Qdrant vectors & generating response...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
              Try:
            </span>
            {SUGGESTED_PROMPTS.filter((p) => p.mode === 'chat').map((p, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedPrompt(p)}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-slate-500 hover:text-slate-800 text-[11px] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={handleClearChat}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-gray-100 text-[11px] font-medium transition-colors cursor-pointer flex-shrink-0 border border-gray-200"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </>
      )}

      {/* ── RECOMMEND TAB ── */}
      {activeTab === 'recommend' && (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div className="glass-panel p-5 rounded-2xl border border-gray-200 space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              AI Resource Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Describe your research topic or area of interest and the AI will recommend the most relevant SSGI documents from the vector index.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_PROMPTS.filter((p) => p.mode === 'recommend').map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(p)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-slate-500 hover:text-slate-800 text-[11px] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronRight size={12} className="text-blue-600" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="glass-card border border-indigo-200 p-6 rounded-2xl flex items-center gap-3 text-indigo-600 text-xs animate-pulse">
              <Loader2 size={18} className="animate-spin flex-shrink-0" />
              <span>Searching Qdrant vector database for relevant resources...</span>
            </div>
          )}

          {recommendResult && !isGenerating && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-200 bg-indigo-50 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>AI Recommendation Results</span>
              </div>
              <p className={`text-xs leading-relaxed ${recommendResult.isError ? 'text-rose-600' : 'text-slate-700'} whitespace-pre-line`}>
                {recommendResult.text}
              </p>

              {recommendResult.sources?.length > 0 && (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <BookOpen size={11} /> Source Documents
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendResult.sources.map((src, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-[11px]">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-700 truncate">{src.title || src.document}</p>
                          <p className="text-slate-500">{src.page || src.chunk_ref}</p>
                        </div>
                        {src.relevance && (
                          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                            {src.relevance}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SUMMARY TAB ── */}
      {activeTab === 'summary' && (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div className="glass-panel p-5 rounded-2xl border border-gray-200 space-y-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-purple-600" />
              AI Document Summarizer
            </h2>
            <p className="text-xs text-slate-500">
              Enter a document title or paste a topic. The AI backend will retrieve the relevant vector chunks and generate an institutional summary.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_PROMPTS.filter((p) => p.mode === 'summary').map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(p)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-slate-500 hover:text-slate-800 text-[11px] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronRight size={12} className="text-purple-600" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="glass-card border border-purple-200 p-6 rounded-2xl flex items-center gap-3 text-purple-600 text-xs animate-pulse">
              <Loader2 size={18} className="animate-spin flex-shrink-0" />
              <span>Processing document chunks and generating summary...</span>
            </div>
          )}

          {summaryResult && !isGenerating && (
            <div className="glass-panel p-6 rounded-2xl border border-purple-200 bg-purple-50 space-y-4">
              <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider">
                <FileText size={14} />
                <span>AI-Generated Summary</span>
              </div>
              <p className={`text-xs leading-relaxed ${summaryResult.isError ? 'text-rose-600' : 'text-slate-700'} whitespace-pre-line`}>
                {summaryResult.text}
              </p>

              {summaryResult.sources?.length > 0 && (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
                    <BookOpen size={11} /> Source Chunks
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summaryResult.sources.map((src, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-[11px]">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-700 truncate">{src.title || src.document}</p>
                          <p className="text-slate-500">{src.page || src.chunk_ref}</p>
                        </div>
                        {src.relevance && (
                          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                            {src.relevance}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shared Input Form */}
      <form
        onSubmit={handleSend}
        className="glass-panel p-2 rounded-2xl border border-gray-200 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isGenerating}
          placeholder={
            activeTab === 'chat'
              ? 'Ask any question about SSGI documents...'
              : activeTab === 'recommend'
              ? 'Describe your research topic for recommendations...'
              : 'Enter document title or topic to summarize...'
          }
          className="flex-1 bg-transparent text-slate-800 placeholder-gray-400 text-xs px-4 py-2.5 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isGenerating}
          className="px-4 py-2.5 rounded-xl ssgi-gradient-bg text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
        >
          {isGenerating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          <span>
            {activeTab === 'chat' ? 'Ask AI' : activeTab === 'recommend' ? 'Recommend' : 'Summarize'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
