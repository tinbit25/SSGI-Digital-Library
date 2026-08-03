import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Plus, CheckCircle2, Loader2,
  RefreshCw, Shield, Trash2, AlertCircle, UserCheck
} from 'lucide-react';
import adminService from '../services/adminService';
import Loading from '../components/Loading';
import ErrorComponent from '../components/ErrorComponent';
import { ROLES } from '../utils/constants';

const MOCK_USERS = [
  { id: 1, name: 'Dr. Alemu Tadesse', email: 'alemu.tadesse@ssgi.gov.et', role: 'administrator', department: 'Executive Management', status: 'active', created_at: '2024-01-10' },
  { id: 2, name: 'Sara Yohannes', email: 'sara.yohannes@ssgi.gov.et', role: 'librarian', department: 'Digital Resource Division', status: 'active', created_at: '2024-02-15' },
  { id: 3, name: 'Samuel Bekele', email: 'samuel.bekele@ssgi.gov.et', role: 'staff', department: 'Remote Sensing Directorate', status: 'active', created_at: '2024-03-20' },
  { id: 4, name: 'Trainee Guest', email: 'guest.trainee@ssgi.gov.et', role: 'guest', department: 'Space Physics Workshop', status: 'active', created_at: '2024-04-05' },
  { id: 5, name: 'Hana Girma', email: 'hana.girma@ssgi.gov.et', role: 'staff', department: 'Geodesy & Geodynamics', status: 'active', created_at: '2024-05-12' },
];

const ROLE_BADGE = {
  administrator: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  librarian:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  staff:         'bg-sky-500/20 text-sky-300 border-sky-500/30',
  guest:         'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const RoleModal = ({ user, onSave, onClose, saving }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-sm rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        <h3 className="text-sm font-bold text-slate-100">Change Role: {user.name}</h3>
        <p className="text-xs text-slate-400">Select the new access role for this user account.</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ROLES).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                selectedRole === r
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(user.id, selectedRole)}
            disabled={saving || selectedRole === user.role}
            className="flex-1 py-2.5 rounded-xl ssgi-gradient-bg text-white text-xs font-semibold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersManagement = () => {
  const [users, setUsers]           = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving]         = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data;
      try {
        data = await adminService.getUsers();
        setUsers(data.users || data.data || data);
      } catch {
        setUsers(MOCK_USERS);
      }
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaveRole = async (userId, newRole) => {
    setSaving(true);
    try {
      try { await adminService.updateUserRole(userId, newRole); }
      catch { console.warn('API updateUserRole offline, updating locally.'); }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
    } catch { alert('Failed to update role. Please try again.'); }
    finally { setSaving(false); }
  };

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role, u.department].some((f) =>
      f?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="text-purple-400" /> User & Role Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage SSGI portal user accounts and assign access roles.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer self-start"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-purple-500/60"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {loading ? <Loading message="Loading user accounts..." /> :
       error   ? <ErrorComponent message={error} onRetry={fetchUsers} /> : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[640px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{u.name}</p>
                        <p className="text-slate-400 text-[11px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{u.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${ROLE_BADGE[u.role] || ROLE_BADGE.guest}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{u.created_at}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Shield size={12} className="text-purple-400" /> Edit Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">No users found for "{searchQuery}".</div>
          )}
        </div>
      )}

      {editingUser && (
        <RoleModal
          user={editingUser}
          saving={saving}
          onSave={handleSaveRole}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UsersManagement;
