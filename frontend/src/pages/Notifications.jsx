import React, { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, CheckCheck, Inbox, Filter } from 'lucide-react';
import notificationService from '../services/notificationService';
import NotificationCard from '../components/NotificationCard';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';

// Fallback dataset when backend GET /api/notifications is offline
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Research Paper Added',
    message:
      '"Equatorial Ionospheric Irregularities & GNSS Disruption Analysis 2024" by SSGI Physics Group is now available for read-only access in the Digital Library.',
    created_at: '2 hours ago',
    is_read: false,
    type: 'new_resource',
  },
  {
    id: 2,
    title: 'AI Library Assistant Upgraded',
    message:
      'Qdrant vector index was refreshed with 12 new technical training manuals. Semantic search precision improved by 25%. Try asking the AI assistant a question.',
    created_at: '1 day ago',
    is_read: false,
    type: 'ai',
  },
  {
    id: 3,
    title: 'Missing Resource Request Resolved',
    message:
      'Your request for "QGIS Python Automation Scripting Guide" has been reviewed. The document was uploaded and is now available in Training Materials.',
    created_at: '3 days ago',
    is_read: true,
    type: 'system',
  },
  {
    id: 4,
    title: 'New Category Published: Geodesy & GNSS Systems',
    message:
      'SSGI librarians created a new category "Geodesy & GNSS Systems" containing 42 technical documents. Browse it from the Library resources page.',
    created_at: '5 days ago',
    is_read: true,
    type: 'new_resource',
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await notificationService.getNotifications();
        const items = data.notifications || data.data || data;
        setNotifications(Array.isArray(items) ? items : MOCK_NOTIFICATIONS);
      } catch (apiErr) {
        console.warn('API GET /api/notifications offline, using local mock notifications:', apiErr);
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (err) {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark a single notification as read via PUT /api/notifications/{id}/read
  const handleMarkAsRead = async (id) => {
    try {
      try {
        await notificationService.markAsRead(id);
      } catch (apiErr) {
        console.warn(`API PUT /api/notifications/${id}/read offline, updating state locally:`, apiErr);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all unread notifications as read in sequence
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (!unread.length) return;
    setMarkingAll(true);
    try {
      for (const notif of unread) {
        try {
          await notificationService.markAsRead(notif.id);
        } catch (apiErr) {
          console.warn(`Offline: locally marking notification ${notif.id} as read.`);
        }
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return Boolean(n.is_read);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="text-blue-600" />
            Notifications & Announcements
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Stay informed about newly uploaded resources, system updates, and feedback resolutions.
          </p>
        </div>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold self-start sm:self-center">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {/* Controls Toolbar */}
      <div className="glass-panel p-3 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-600" /> View:
          </span>
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs capitalize font-medium transition-all cursor-pointer ${
                filter === f
                  ? 'bg-blue-50 text-blue-600 border border-blue-300 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'all' ? `All (${notifications.length})` : f === 'unread' ? `Unread (${unreadCount})` : 'Read'}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCheck size={14} />
              <span>{markingAll ? 'Marking...' : 'Mark All as Read'}</span>
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-gray-100 transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Loading message="Loading notifications..." />
      ) : error ? (
        <ErrorComponent message={error} onRetry={fetchNotifications} />
      ) : filteredNotifications.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl border border-gray-200 text-center max-w-sm mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Found'}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            {filter === 'unread'
              ? 'All caught up! You have no unread notifications at this time.'
              : 'Notifications from SSGI Librarians and system updates will appear here.'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-semibold border border-gray-300 transition-colors cursor-pointer"
            >
              View All Notifications
            </button>
          )}
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} onMarkAsRead={handleMarkAsRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
