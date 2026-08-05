import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Lock, 
  ShieldCheck, 
  X, 
  Maximize2, 
  Minimize2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import resourceService from '../services/resourceService';
import useAuth from '../hooks/useAuth';
import Loading from './Loading';
import ErrorComponent from './ErrorComponent';

const DocumentViewer = ({ resourceId, resourceTitle = 'Digital Resource Document', onClose }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewerUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/resources/${resourceId}/viewer?format=pdf`;

  // Security Interceptor: Block Ctrl+P, Cmd+P, Ctrl+S, Cmd+S, Ctrl+U
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert('Security Alert: Printing, saving, and downloading protected SSGI documents are strictly disabled.');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-md flex flex-col transition-all duration-200 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      {/* Outer Protected Frame Container */}
      <div className="w-full h-full glass-panel rounded-3xl border border-gray-200 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Control Toolbar (NO Download, NO Print) */}
        <header className="p-3 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between gap-4 z-20">
          {/* Document Title & Security Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{resourceTitle}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Lock size={10} /> Online Read-Only Viewer
                </span>
                <span className="hidden md:inline">&bull;</span>
                <span className="hidden md:inline">User: {user?.email || 'Authorized Reader'}</span>
              </div>
            </div>
          </div>

          {/* Controls: Page Navigation & Zoom */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-[11px] font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages || loading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 75}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-600">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 175}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Fullscreen & Close Triggers */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Close Viewer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Canvas & Content Viewer Body (Right-click & Selection Disabled) */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="flex-1 overflow-auto bg-gray-50 flex justify-center items-center select-none relative"
        >
          <iframe
            src={viewerUrl}
            className="w-full h-full border-none"
            title={resourceTitle}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError("Failed to load PDF securely.");
            }}
          />
        </div>

        {/* Bottom Status Bar */}
        <footer className="p-2.5 bg-white border-t border-gray-200 flex items-center justify-between text-[11px] text-slate-500 px-6">
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <ShieldCheck size={14} />
            <span>Protected Canvas Renderer Active</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              No Download / No Export
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DocumentViewer;
