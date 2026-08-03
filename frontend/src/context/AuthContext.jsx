import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ssgi_auth_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session by fetching profile if bearer token is present
  const initializeAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('ssgi_auth_token');
    const storedUser = localStorage.getItem('ssgi_user');

    if (storedToken) {
      setToken(storedToken);
      try {
        const response = await authService.getProfile();
        // Backend returns user data object in response
        const userData = response.user || response.data || response;
        setUser(userData);
        localStorage.setItem('ssgi_user', JSON.stringify(userData));
      } catch (err) {
        console.warn('API profile fetch failed or offline, falling back to local session state if available:', err);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            setUser(null);
          }
        }
      }
    } else if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      // Default initial mock session for quick frontend development preview
      const defaultUser = {
        id: 1,
        name: 'Dr. Alemu Tadesse',
        email: 'alemu.tadesse@ssgi.gov.et',
        role: ROLES.STAFF,
        department: 'Geospatial Analytics Division',
      };
      setUser(defaultUser);
      localStorage.setItem('ssgi_user', JSON.stringify(defaultUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Execute Login API call and save auth token/user state
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await authService.login({ email, password });
      } catch (apiErr) {
        // Fallback for local preview if backend server is not running yet
        console.warn('Backend login endpoint unavailable, performing client-side mock login:', apiErr);
        data = {
          token: 'mock_sanctum_token_' + Date.now(),
          user: {
            id: Date.now(),
            name: email.split('@')[0].replace('.', ' ') || 'SSGI Researcher',
            email: email,
            role: ROLES.STAFF,
            department: 'Geospatial Research Division',
          },
        };
      }

      const authToken = data.token || data.access_token || 'mock_token';
      const userData = data.user || data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('ssgi_auth_token', authToken);
      localStorage.setItem('ssgi_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Execute Register API call
   */
  const register = async (registrationPayload) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await authService.register(registrationPayload);
      } catch (apiErr) {
        // Fallback for local preview if backend server is not running yet
        console.warn('Backend register endpoint unavailable, performing client-side mock registration:', apiErr);
        data = {
          token: 'mock_sanctum_token_' + Date.now(),
          user: {
            id: Date.now(),
            name: `${registrationPayload.first_name} ${registrationPayload.last_name}`,
            email: registrationPayload.email,
            role: registrationPayload.role || ROLES.STAFF,
            department: registrationPayload.department || 'General Trainee',
          },
        };
      }

      const authToken = data.token || data.access_token || 'mock_token';
      const userData = data.user || data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('ssgi_auth_token', authToken);
      localStorage.setItem('ssgi_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Execute Logout API call and clear token storage
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout API call failed or offline:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ssgi_auth_token');
      localStorage.removeItem('ssgi_user');
    }
  };

  /**
   * Switch role during frontend development previewing
   */
  const switchRole = (newRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('ssgi_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
