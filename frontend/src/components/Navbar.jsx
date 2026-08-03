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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-gray-100 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-all">
              <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center font-black text-blue-600 text-sm tracking-wider">
                SSGI
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 text-base tracking-tight block leading-tight">
                {SYSTEM_INFO.ABBREVIATION} <span className="ssgi-gradient-text">Digital Library</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">
                Space Science & Geospatial Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Section: Quick Resource Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search research papers, books, maps & training manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-700 placeholder-gray-400 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </form>
        </div>

        {/* Right Section: AI Quick Action, Role Selector, User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Quick AI Assistant Trigger */}
          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles size={14} className="text-indigo-600 animate-pulse" />
            <span>AI Assistant</span>
          </Link>

          {/* Quick Notification Icon */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </Link>

          {/* User Profile & Role Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-500 hidden lg:block" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-lg border border-gray-200 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Role</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Dev Role Switcher for RBAC Preview */}
                  <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-xl my-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Shield size={10} className="text-blue-600" /> Switch Role (Preview):
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
                              ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' 
                              : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'
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
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
                    >
                      <User size={14} className="text-blue-600" />
                      <span>Profile & Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors mt-1 text-left cursor-pointer"
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
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl ssgi-gradient-bg text-white text-xs font-semibold shadow-lg shadow-blue-500/15 hover:brightness-110 transition-all"
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
