export const ROLES = {
  ADMIN: 'administrator',
  LIBRARIAN: 'librarian',
  STAFF: 'staff',
  GUEST: 'guest',
};

export const SYSTEM_INFO = {
  NAME: 'SSGI Digital Library Portal',
  INSTITUTION: 'Ethiopian Space Science and Geospatial Institute',
  ABBREVIATION: 'SSGI',
  VERSION: '1.0.0',
};

/**
 * Role-Based Navigation Configuration
 */
export const NAVIGATION_BY_ROLE = {
  [ROLES.ADMIN]: [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Users', path: '/users', icon: 'Users' },
    { name: 'Resources', path: '/resources', icon: 'BookOpen' },
    { name: 'Reports', path: '/reports', icon: 'BarChart3' },
    { name: 'Notifications', path: '/notifications', icon: 'Bell' },
  ],
  [ROLES.LIBRARIAN]: [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Upload Resource', path: '/resources/upload', icon: 'Upload' },
    { name: 'Manage Resources', path: '/resources/manage', icon: 'FolderKanban' },
    { name: 'Categories', path: '/categories', icon: 'Tag' },
    { name: 'Feedback', path: '/feedback', icon: 'MessageSquare' },
  ],
  [ROLES.STAFF]: [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Library', path: '/resources', icon: 'BookOpen' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: 'Bot', badge: 'RAG' },
    { name: 'Notifications', path: '/notifications', icon: 'Bell' },
    { name: 'Feedback', path: '/feedback', icon: 'MessageSquare' },
  ],
  [ROLES.GUEST]: [
    { name: 'Library', path: '/resources', icon: 'BookOpen' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: 'Bot', badge: 'RAG' },
    { name: 'Notifications', path: '/notifications', icon: 'Bell' },
    { name: 'Feedback', path: '/feedback', icon: 'MessageSquare' },
  ],
};
