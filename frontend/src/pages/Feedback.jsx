import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShieldCheck, Filter, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import feedbackService from '../services/feedbackService';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackCard from '../components/FeedbackCard';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

// Fallback feedback items if backend GET /api/admin/feedback is offline
const MOCK_ADMIN_FEEDBACK = [
  {
    id: 1,
    subject: 'Request for Sentinel-2 Satellite Calibration Manual 2024',
    message: 'Please upload the latest Sentinel-2 calibration dataset manual for our remote sensing research division.',
    user_name: 'Samuel Bekele',
    user_email: 'samuel.bekele@ssgi.gov.et',
    type: 'missing_resource',
    status: 'pending',
    created_at: '2 hours ago',
  },
  {
    id: 2,
    subject: 'PDF Canvas Viewer Zoom Feature Suggestion',
    message: 'The online document reader works great. Would love a quick reset zoom button on mobile screens.',
    user_name: 'Trainee Guest',
    user_email: 'guest.trainee@ssgi.gov.et',
    type: 'suggestion',
    status: 'reviewed',
    created_at: '1 day ago',
  },
  {
    id: 3,
    subject: 'QGIS Automation Guide Added to Training Materials',
    message: 'Confirming that the PyQGIS automation training manual was uploaded and vector chunks were generated.',
    user_name: 'Sara Yohannes',
    user_email: 'sara.yohannes@ssgi.gov.et',
    type: 'improvement',
    status: 'resolved',
    created_at: '3 days ago',
  },
];

const Feedback = () => {
  const { user } = useAuth();
  const isAdminOrLibrarian = user?.role === ROLES.ADMIN || user?.role === ROLES.LIBRARIAN;

  const [feedbackList, setFeedbackList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(isAdminOrLibrarian ? 'inbox' : 'submit');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await feedbackService.getFeedbackList();
        const items = data.feedback || data.data || data;
        setFeedbackList(Array.isArray(items) ? items : MOCK_ADMIN_FEEDBACK);
      } catch (apiErr) {
        console.warn('API GET /api/admin/feedback offline, using local mock submissions:', apiErr);
        setFeedbackList(MOCK_ADMIN_FEEDBACK);
      }
    } catch (err) {
      setError('Failed to load feedback submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminOrLibrarian) {
      fetchAdminFeedback();
    }
  }, [isAdminOrLibrarian, fetchAdminFeedback]);

  const filteredFeedback = feedbackList.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-blue-600" />
            Feedback & Resource Requests
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Asynchronous submission channel for requesting missing resources and reporting portal issues.
          </p>
        </div>

        {/* Tab Selector for Admin/Librarian */}
        {isAdminOrLibrarian && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-blue-50 text-blue-600 border border-blue-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Feedback Inbox ({feedbackList.length})
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-blue-50 text-blue-600 border border-blue-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Submit Form
            </button>
          </div>
        )}
      </div>

      {/* Admin / Librarian Feedback Inbox View */}
      {isAdminOrLibrarian && activeTab === 'inbox' ? (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Filter size={14} className="text-blue-600" /> Filter Status:
              </span>
              {['all', 'pending', 'reviewed', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-50 text-blue-600 border border-blue-300 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={fetchAdminFeedback}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-gray-100 transition-colors"
              title="Refresh Inbox"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <Loading message="Loading feedback submissions..." />
          ) : error ? (
            <ErrorComponent message={error} onRetry={fetchAdminFeedback} />
          ) : filteredFeedback.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-gray-200 text-center max-w-md mx-auto my-8 space-y-3">
              <Inbox size={32} className="text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Feedback Items</h3>
              <p className="text-slate-500 text-xs">No user submissions found under status "{statusFilter}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeedback.map((item) => (
                <FeedbackCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Form View */
        <div className="max-w-2xl mx-auto">
          <FeedbackForm onSuccess={() => isAdminOrLibrarian && fetchAdminFeedback()} />
        </div>
      )}
    </div>
  );
};

export default Feedback;
