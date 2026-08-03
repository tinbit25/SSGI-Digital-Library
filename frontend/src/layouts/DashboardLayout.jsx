import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show animated loading screen while AuthContext hydrates from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Initializing SSGI Digital Library System..." />
      </div>
    );
  }

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-800 selection:bg-blue-200 selection:text-blue-800">
      {/* Sticky Top Navigation */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen((o) => !o)} isSidebarOpen={isSidebarOpen} />

      {/* Main Body with Sidebar + Outlet */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Collapsible Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
