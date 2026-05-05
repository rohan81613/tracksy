import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tracksy_token';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // --- Toast helpers ---
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Rehydrate on mount ---
  useEffect(() => {
    async function rehydrate() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        setCurrentUser(response.data.user ?? response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setCurrentUser(null);
        }
      } finally {
        setAuthLoading(false);
      }
    }
    rehydrate();
  }, []);

  const signup = useCallback(async (name, email, password, company = '') => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        password_confirmation: password,
        company,
      });
      localStorage.setItem(TOKEN_KEY, response.data.token);
      setCurrentUser(response.data.user);
    } catch (err) {
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, response.data.token);
      setCurrentUser(response.data.user);
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore errors — always clear local state
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setCurrentUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await api.put('/api/auth/profile', updates);
      setCurrentUser(response.data.user ?? response.data);
    } catch (err) {
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPassword,
      });
      addToast('Password changed successfully', 'success');
    } catch (err) {
      addToast(err.message ?? 'Failed to change password', 'error');
      throw err;
    }
  }, [addToast]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      authLoading,
      toasts,
      addToast,
      removeToast,
      signup,
      login,
      logout,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
