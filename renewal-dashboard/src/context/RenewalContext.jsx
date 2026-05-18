import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { toSnake } from '../api.js';
import { useAuth } from './AuthContext';

const RenewalContext = createContext(null);

/** Convert a single camelCase key to snake_case for query params */
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
}

export function RenewalProvider({ children }) {
  const { currentUser } = useAuth();

  const [renewals, setRenewals] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // UI state — unchanged
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'renewalDate', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // --- Toast helpers ---
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Parallel fetch ---
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      params.sort_by = camelToSnake(sortConfig.key);
      params.sort_dir = sortConfig.direction;

      const [renewalsRes, statsRes, categoriesRes, notifRes] = await Promise.allSettled([
        api.get('/api/renewals', { params }),
        api.get('/api/renewals/stats'),
        api.get('/api/categories'),
        api.get('/api/notifications'),
      ]);

      if (renewalsRes.status === 'fulfilled') {
        setRenewals(renewalsRes.value.data.data ?? renewalsRes.value.data);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.data.all ?? categoriesRes.value.data);
      }
      if (notifRes.status === 'fulfilled') {
        setNotifications(prev => {
          const readMap = new Map(prev.map(n => [n.id, n.read]));
          const notifList = notifRes.value.data.notifications ?? notifRes.value.data;
          return notifList.map(n => ({ ...n, read: readMap.get(n.id) ?? false }));
        });
      }
    } catch (err) {
      // Network-level failure — keep existing data, don't crash
      console.error('fetchAll error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, searchQuery, statusFilter, sortConfig]);

  // Fetch on mount / when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchAll();
    }
  }, [currentUser]);

  const refreshRenewals = useCallback(() => fetchAll(), [fetchAll]);

  // --- Renewal CRUD ---
  const addRenewal = useCallback(async (data) => {
    try {
      await api.post('/api/renewals', toSnake(data));
      await fetchAll();
      addToast('Renewal added successfully', 'success');
    } catch (err) {
      addToast(err.message ?? 'Failed to add renewal', 'error');
    }
  }, [fetchAll]);

  const updateRenewal = useCallback(async (id, data) => {
    try {
      await api.put(`/api/renewals/${id}`, toSnake(data));
      await fetchAll();
      addToast('Renewal updated successfully', 'success');
    } catch (err) {
      addToast(err.message ?? 'Failed to update renewal', 'error');
    }
  }, [fetchAll]);

  const deleteRenewal = useCallback(async (id) => {
    try {
      await api.delete(`/api/renewals/${id}`);
      await fetchAll();
      addToast('Renewal deleted', 'success');
    } catch (err) {
      addToast(err.message ?? 'Failed to delete renewal', 'error');
    }
  }, [fetchAll]);

  // --- Category CRUD ---
  const addCategory = useCallback(async (name) => {
    try {
      await api.post('/api/categories', { name });
      setCategories(prev => [...prev, name]);
    } catch (err) {
      addToast(err.errors?.name?.[0] ?? err.message ?? 'Failed to add category', 'error');
    }
  }, []);

  const deleteCategory = useCallback(async (name) => {
    try {
      await api.delete(`/api/categories/${encodeURIComponent(name)}`);
      setCategories(prev => prev.filter(c => c !== name));
    } catch (err) {
      addToast(err.message ?? 'Failed to delete category', 'error');
    }
  }, []);

  // --- Notification read state (client-side only) ---
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <RenewalContext.Provider value={{
      renewals,
      stats,
      categories,
      notifications,
      isLoading,
      toasts,
      searchQuery,
      statusFilter,
      sortConfig,
      currentPage,
      sidebarOpen,
      selectedVendorId,
      unreadCount,
      setSearchQuery,
      setStatusFilter,
      setSortConfig,
      setCurrentPage,
      setSidebarOpen,
      setSelectedVendorId,
      addRenewal,
      updateRenewal,
      deleteRenewal,
      addCategory,
      deleteCategory,
      markNotificationRead,
      markAllNotificationsRead,
      refreshRenewals,
      addToast,
      removeToast,
    }}>
      {children}
    </RenewalContext.Provider>
  );
}

export function useRenewal() {
  const ctx = useContext(RenewalContext);
  if (!ctx) throw new Error('useRenewal must be used within RenewalProvider');
  return ctx;
}
