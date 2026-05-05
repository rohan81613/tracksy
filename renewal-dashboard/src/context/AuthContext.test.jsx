import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';

// Mock the api module
vi.mock('../api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import api from '../api.js';

// Helper component to capture auth context values
function TestComponent({ capture }) {
  const auth = useAuth();
  capture(auth);
  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Default: GET /api/auth/me returns 401 (no token)
  api.get.mockRejectedValue({ response: { status: 401 } });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
});

// ─── Test: logout() removes tracksy_token from localStorage ──────────────────
// Validates: Requirements 2.3
describe('logout()', () => {
  it('removes tracksy_token from localStorage', async () => {
    // Rehydrate succeeds so the token is NOT cleared on mount
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
    api.get.mockResolvedValue({ data: user });
    api.post.mockResolvedValue({ data: {} });

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    // Manually set the token after mount (simulating a logged-in state)
    localStorage.setItem('tracksy_token', 'my-token');
    expect(localStorage.getItem('tracksy_token')).toBe('my-token');

    await act(async () => {
      await capturedAuth.logout();
    });

    expect(localStorage.getItem('tracksy_token')).toBeNull();
  });

  it('removes tracksy_token even when the logout API call fails', async () => {
    // Rehydrate succeeds so the token is NOT cleared on mount
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
    api.get.mockResolvedValue({ data: user });
    // logout call fails
    api.post.mockRejectedValue(new Error('Network error'));

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    localStorage.setItem('tracksy_token', 'my-token');

    await act(async () => {
      await capturedAuth.logout();
    });

    expect(localStorage.getItem('tracksy_token')).toBeNull();
  });
});

// ─── Test: 401 on GET /api/auth/me clears token and sets currentUser to null ──
// Validates: Requirements 2.5
describe('rehydrate() — 401 on GET /api/auth/me', () => {
  it('clears tracksy_token and sets currentUser to null on 401', async () => {
    localStorage.setItem('tracksy_token', 'stale-token');

    // Simulate 401 from /api/auth/me
    api.get.mockRejectedValue({ response: { status: 401 } });

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    // Wait for rehydration to complete
    await waitFor(() => {
      expect(capturedAuth.authLoading).toBe(false);
    });

    expect(localStorage.getItem('tracksy_token')).toBeNull();
    expect(capturedAuth.currentUser).toBeNull();
  });

  it('sets currentUser from response when GET /api/auth/me succeeds', async () => {
    const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
    localStorage.setItem('tracksy_token', 'valid-token');
    api.get.mockResolvedValue({ data: user });

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(capturedAuth.authLoading).toBe(false);
    });

    expect(capturedAuth.currentUser).toEqual(user);
    expect(localStorage.getItem('tracksy_token')).toBe('valid-token');
  });
});

// ─── Test: changePassword() shows success toast on 200 and error toast on failure
// Validates: Requirements 2.7
describe('changePassword()', () => {
  it('adds a success toast when the API call succeeds', async () => {
    api.put.mockResolvedValue({ data: {} });

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      try {
        await capturedAuth.changePassword('oldpass', 'newpass');
      } catch {
        // may or may not throw
      }
    });

    expect(capturedAuth.toasts.length).toBeGreaterThan(0);
    const successToast = capturedAuth.toasts.find(t => t.type === 'success');
    expect(successToast).toBeDefined();
    expect(successToast.message).toMatch(/password changed/i);
  });

  it('adds an error toast when the API call fails', async () => {
    const errorMessage = 'Current password is incorrect';
    api.put.mockRejectedValue(new Error(errorMessage));

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      try {
        await capturedAuth.changePassword('wrongpass', 'newpass');
      } catch {
        // expected to throw
      }
    });

    expect(capturedAuth.toasts.length).toBeGreaterThan(0);
    const errorToast = capturedAuth.toasts.find(t => t.type === 'error');
    expect(errorToast).toBeDefined();
    expect(errorToast.message).toBe(errorMessage);
  });

  it('adds a generic error toast when the error has no message', async () => {
    api.put.mockRejectedValue({});

    let capturedAuth;
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent capture={(auth) => { capturedAuth = auth; }} />
        </AuthProvider>
      );
    });

    await act(async () => {
      try {
        await capturedAuth.changePassword('oldpass', 'newpass');
      } catch {
        // expected to throw
      }
    });

    const errorToast = capturedAuth.toasts.find(t => t.type === 'error');
    expect(errorToast).toBeDefined();
    expect(errorToast.message).toMatch(/failed to change password/i);
  });
});
