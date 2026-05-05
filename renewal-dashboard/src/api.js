import axios from 'axios';

/**
 * Converts a snake_case string to camelCase.
 * @param {string} str
 * @returns {string}
 */
function snakeToCamelStr(str) {
  return str.replace(/(?<=[a-zA-Z0-9])_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case.
 * @param {string} str
 * @returns {string}
 */
function camelToSnakeStr(str) {
  return str.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts all object keys from snake_case to camelCase.
 * Handles plain objects, arrays, primitives, null, and undefined.
 * @param {*} obj
 * @returns {*}
 */
export function toCamel(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (typeof obj !== 'object') return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      snakeToCamelStr(key),
      toCamel(value),
    ])
  );
}

/**
 * Recursively converts all object keys from camelCase to snake_case.
 * Handles plain objects, arrays, primitives, null, and undefined.
 * @param {*} obj
 * @returns {*}
 */
export function toSnake(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (typeof obj !== 'object') return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      camelToSnakeStr(key),
      toSnake(value),
    ])
  );
}

/**
 * Axios instance with base URL, default headers, and request/response interceptors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tracksy_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Response interceptor: camelCase keys on success, handle errors
api.interceptors.response.use(
  (response) => {
    response.data = toCamel(response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('tracksy_token');
        window.location.href = '/login';
        throw error;
      }
      if (status === 422) {
        const err = new Error(error.response.data.message ?? 'Validation failed');
        err.errors = error.response.data.errors ?? {};
        throw err;
      }
      throw error;
    }
    if (!error.response) {
      throw { message: 'Unable to reach server', type: 'network' };
    }
    throw error;
  }
);

export default api;

// ─── Vendor Entry API helpers ─────────────────────────────────────────────────
export const getVendorEntries = (renewalId) =>
  api.get(`/api/renewals/${renewalId}/vendor-entries`);

export const createVendorEntry = (renewalId, payload) =>
  api.post(`/api/renewals/${renewalId}/vendor-entries`, payload);

export const updateVendorEntry = (renewalId, entryId, payload) =>
  api.put(`/api/renewals/${renewalId}/vendor-entries/${entryId}`, payload);

export const deleteVendorEntry = (renewalId, entryId) =>
  api.delete(`/api/renewals/${renewalId}/vendor-entries/${entryId}`);
