import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Shield, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES, SYSTEM_INFO } from '../utils/constants';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, switchRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case ROLES.LIBRARIAN:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case ROLES.STAFF:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case ROLES.GUEST:
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-sky-500/10 group-hover:shadow-sky-500/25 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-sky-400 text-sm tracking-wider">
                SSGI
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-100 text-base tracking-tight block leading-tight">
                {SYSTEM_INFO.ABBREVIATION} <span className="ssgi-gradient-text">Digital Library</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Space Science & Geospatial Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Section: Quick Resource Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search research papers, books, maps & training manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </form>
        </div>

        {/* Right Section: AI Quick Action, Role Selector, User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Quick AI Assistant Trigger */}
          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>AI Assistant</span>
          </Link>

          {/* Quick Notification Icon */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-950"></span>
          </Link>

          {/* User Profile & Role Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl border border-slate-800 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-800">
                    <p className="font-semibold text-slate-100">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Role</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Dev Role Switcher for RBAC Preview */}
                  <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 rounded-xl my-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Shield size={10} className="text-sky-400" /> Switch Role (Preview):
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.values(ROLES).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r);
                            setShowUserMenu(false);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-medium text-left capitalize transition-colors ${
                            user.role === r 
                              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' 
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <User size={14} className="text-sky-400" />
                      <span>Profile & Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl ssgi-gradient-bg text-white text-xs font-semibold shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
