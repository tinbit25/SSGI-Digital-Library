import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Shared Pages
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import ResourceDetails from './pages/ResourceDetails';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import AIAssistant from './pages/AIAssistant';

// Librarian Pages
import UploadResource from './pages/UploadResource';
import ManageResources from './pages/ManageResources';
import Categories from './pages/Categories';

// Administrator Pages
import UsersManagement from './pages/UsersManagement';
import Reports from './pages/Reports';

// 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Private App Routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Librarian Routes — must be BEFORE :id wildcard */}
            <Route path="/resources/upload"  element={<UploadResource />} />
            <Route path="/resources/manage"  element={<ManageResources />} />

            {/* Digital Library Browsing */}
            <Route path="/resources"     element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />

            {/* Librarian — Categories */}
            <Route path="/categories" element={<Categories />} />

            {/* Administrator Routes */}
            <Route path="/users"   element={<UsersManagement />} />
            <Route path="/reports" element={<Reports />} />

            {/* Shared Modules */}
            <Route path="/ai-assistant"  element={<AIAssistant />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/feedback"      element={<Feedback />} />
            <Route path="/profile"       element={<Profile />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
