import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Bell, 
  Upload, 
  FolderKanban, 
  Tag, 
  MessageSquare, 
  Bot, 
  ShieldCheck, 
  Lock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES, NAVIGATION_BY_ROLE } from '../utils/constants';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Bell,
  Upload,
  FolderKanban,
  Tag,
  MessageSquare,
  Bot,
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const currentRole = user?.role || ROLES.GUEST;

  // Retrieve navigation items strictly configured for active user role
  const navItems = NAVIGATION_BY_ROLE[currentRole] || NAVIGATION_BY_ROLE[ROLES.GUEST];

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case ROLES.LIBRARIAN:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case ROLES.STAFF:
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case ROLES.GUEST:
      default:
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  return (
    <>
      {/* Responsive Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 glass-panel border-r border-gray-200 z-50 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Active Role Card Header */}
          <div className="px-3 pt-2 border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Portal View</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadgeStyle(currentRole)}`}>
                {currentRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {currentRole === ROLES.ADMIN && 'System Administration & Security Auditing'}
              {currentRole === ROLES.LIBRARIAN && 'Resource Upload & Content Management'}
              {currentRole === ROLES.STAFF && 'Staff Research & Document Discovery'}
              {currentRole === ROLES.GUEST && 'Guest Trainee Read-Only Access'}
            </p>
          </div>

          {/* Role-Based Menu List */}
          <nav className="flex flex-col gap-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Navigation Menu
            </p>
            {navItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || BookOpen;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 shadow-md shadow-blue-500/5 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar DRM & System Security Status */}
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Lock size={16} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-700">DRM Enforcement</p>
              <p className="text-[10px] text-slate-500">Read-Only Protected</p>
            </div>
          </div>

          <div className="px-3 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate">{user?.email || 'guest@ssgi.gov.et'}</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <Sparkles size={10} /> Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
