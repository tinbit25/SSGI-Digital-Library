import React from 'react';
import { User, Shield, Key, Building, Mail, Lock, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES, SYSTEM_INFO } from '../utils/constants';

const Profile = () => {
  const { user, switchRole } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="text-blue-600" />
          Profile & Security Settings
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage your SSGI account details and access permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-200 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/15">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-50 text-blue-600 border border-blue-200">
                <Shield size={12} /> {user?.role}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Department</span>
                <span className="text-slate-700 font-medium">{user?.department || 'Geospatial Analytics Division'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Institution</span>
                <span className="text-slate-700 font-medium">{SYSTEM_INFO.ABBREVIATION} Portal</span>
              </div>
            </div>
          </div>

          {/* Dev Role Preview Switcher */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                <Sparkles size={14} /> Frontend Role Switcher (Development Preview)
              </span>
              <span className="text-[10px] text-slate-400">Instant State Toggle</span>
            </div>
            <p className="text-xs text-slate-500">
              Switch roles below to preview different RBAC interfaces (Admin dashboard capabilities vs Librarian document uploading vs Staff/Guest reading views):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(ROLES).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                    user?.role === r
                      ? 'bg-blue-50 text-blue-600 border border-blue-300 font-bold'
                      : 'bg-gray-100 text-slate-500 hover:text-slate-800 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DRM Security Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Lock size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">DRM Security Policy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your account is authenticated via Laravel Sanctum REST API. All document reading sessions are monitored and watermarked.
          </p>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-600 font-medium">
            Status: Read-Only DRM Protected
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
