import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { format } from 'date-fns';
import { RenewalProvider, useRenewal } from './RenewalContext.jsx';
import { AuthProvider } from './AuthContext.jsx';

// Mock the api module
vi.mock('../api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  toSnake: vi.fn((obj) => obj),
}));

import api from '../api.js';

// Helper component to capture renewal context values
function TestComponent({ capture }) {
  const renewal = useRenewal();
  capture(renewal);
  return null;
}

// Default mock responses for all API calls made on mount
function setupDefaultMocks() {
  api.get.mockImplementation((url) => {
    if (url === '/api/renewals') return Promise.resolve({ data: [] });
    if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
    if (url === '/api/categories') return Promise.resolve({ data: [] });
    if (url === '/api/notifications') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Set a token so currentUser rehydration succeeds
  localStorage.setItem('tracksy_token', 'test-token');
  setupDefaultMocks();
  // AuthContext rehydration: GET /api/auth/me
  api.get.mockImplementation((url) => {
    if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
    if (url === '/api/renewals') return Promise.resolve({ data: [] });
    if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
    if (url === '/api/categories') return Promise.resolve({ data: [] });
    if (url === '/api/notifications') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
});

// Feature: backend-continuation, Property 4
// Validates: Requirements 3.2
describe('Property 4: Renewal creation adds the API response to state', () => {
  it('after addRenewal(payload) resolves, renewals contains an object matching the mocked API response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          vendor: fc.string({ minLength: 1 }),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
          billingCycle: fc.constantFrom('monthly', 'yearly'),
          renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
        }),
        async (payload) => {
          // The mocked API response for the created renewal
          const mockCreatedRenewal = {
            id: 42,
            name: payload.name,
            vendor: payload.vendor,
            amount: payload.amount,
            billingCycle: payload.billingCycle,
            renewalDate: payload.renewalDate,
          };

          // After POST, the re-fetch returns the new renewal in the list
          api.post.mockResolvedValue({ data: mockCreatedRenewal });
          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: [mockCreatedRenewal] });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 1, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          let capturedRenewal;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedRenewal = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(capturedRenewal.isLoading).toBe(false);
          });

          // Call addRenewal
          await act(async () => {
            await capturedRenewal.addRenewal(payload);
          });

          // renewals should contain an object matching the mocked API response
          expect(capturedRenewal.renewals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: mockCreatedRenewal.id,
                name: mockCreatedRenewal.name,
                vendor: mockCreatedRenewal.vendor,
                billingCycle: mockCreatedRenewal.billingCycle,
                renewalDate: mockCreatedRenewal.renewalDate,
              }),
            ])
          );
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 5
// Validates: Requirements 3.4
describe('Property 5: Renewal deletion removes the item from state', () => {
  it('after deleteRenewal(id) resolves, no item in renewals has that id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1 }),
            vendor: fc.string({ minLength: 1 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
            billingCycle: fc.constantFrom('monthly', 'yearly'),
            renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
          }),
          { minLength: 1, maxLength: 5 }
        ).chain((items) => {
          // Deduplicate by id
          const unique = Array.from(new Map(items.map((r) => [r.id, r])).values());
          return fc.tuple(
            fc.constant(unique),
            fc.integer({ min: 0, max: unique.length - 1 })
          );
        }),
        async ([renewalList, indexToDelete]) => {
          const targetId = renewalList[indexToDelete].id;
          const listAfterDelete = renewalList.filter((r) => r.id !== targetId);

          // Initial fetch returns the full list
          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: renewalList });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: renewalList.length, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          api.delete.mockResolvedValue({ data: {} });

          let capturedRenewal;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedRenewal = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(capturedRenewal.isLoading).toBe(false);
          });

          // After delete, re-fetch returns list without the deleted item
          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: listAfterDelete });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: listAfterDelete.length, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          // Call deleteRenewal
          await act(async () => {
            await capturedRenewal.deleteRenewal(targetId);
          });

          // No item in renewals should have the deleted id
          const ids = capturedRenewal.renewals.map((r) => r.id);
          expect(ids).not.toContain(targetId);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 6
// Validates: Requirements 3.6
describe('Property 6: Failed mutation leaves state unchanged', () => {
  it('after a failed addRenewal (POST fails), renewals deeply equals renewals before the call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1 }),
            vendor: fc.string({ minLength: 1 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
            billingCycle: fc.constantFrom('monthly', 'yearly'),
            renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        fc.record({
          name: fc.string({ minLength: 1 }),
          vendor: fc.string({ minLength: 1 }),
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
          billingCycle: fc.constantFrom('monthly', 'yearly'),
          renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
        }),
        async (initialRenewals, newPayload) => {
          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: initialRenewals });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: initialRenewals.length, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          // POST fails
          api.post.mockRejectedValue(new Error('Server error'));

          let capturedRenewal;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedRenewal = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedRenewal.isLoading).toBe(false);
          });

          const renewalsBefore = capturedRenewal.renewals;

          await act(async () => {
            await capturedRenewal.addRenewal(newPayload);
          });

          expect(capturedRenewal.renewals).toEqual(renewalsBefore);
        }
      ),
      { numRuns: 5 }
    );
  });

  it('after a failed updateRenewal (PUT fails), renewals deeply equals renewals before the call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1 }),
            vendor: fc.string({ minLength: 1 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
            billingCycle: fc.constantFrom('monthly', 'yearly'),
            renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
          }),
          { minLength: 1, maxLength: 5 }
        ).chain((items) => {
          const unique = Array.from(new Map(items.map((r) => [r.id, r])).values());
          return fc.tuple(
            fc.constant(unique),
            fc.integer({ min: 0, max: unique.length - 1 }),
            fc.record({
              name: fc.string({ minLength: 1 }),
              vendor: fc.string({ minLength: 1 }),
              amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
              billingCycle: fc.constantFrom('monthly', 'yearly'),
              renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
            })
          );
        }),
        async ([renewalList, indexToUpdate, updatePayload]) => {
          const targetId = renewalList[indexToUpdate].id;

          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: renewalList });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: renewalList.length, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          // PUT fails
          api.put.mockRejectedValue(new Error('Server error'));

          let capturedRenewal;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedRenewal = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedRenewal.isLoading).toBe(false);
          });

          const renewalsBefore = capturedRenewal.renewals;

          await act(async () => {
            await capturedRenewal.updateRenewal(targetId, updatePayload);
          });

          expect(capturedRenewal.renewals).toEqual(renewalsBefore);
        }
      ),
      { numRuns: 5 }
    );
  });

  it('after a failed deleteRenewal (DELETE fails), renewals deeply equals renewals before the call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1 }),
            vendor: fc.string({ minLength: 1 }),
            amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
            billingCycle: fc.constantFrom('monthly', 'yearly'),
            renewalDate: fc.date().map((d) => format(d, 'yyyy-MM-dd')),
          }),
          { minLength: 1, maxLength: 5 }
        ).chain((items) => {
          const unique = Array.from(new Map(items.map((r) => [r.id, r])).values());
          return fc.tuple(
            fc.constant(unique),
            fc.integer({ min: 0, max: unique.length - 1 })
          );
        }),
        async ([renewalList, indexToDelete]) => {
          const targetId = renewalList[indexToDelete].id;

          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: renewalList });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: renewalList.length, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          // DELETE fails
          api.delete.mockRejectedValue(new Error('Server error'));

          let capturedRenewal;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedRenewal = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedRenewal.isLoading).toBe(false);
          });

          const renewalsBefore = capturedRenewal.renewals;

          await act(async () => {
            await capturedRenewal.deleteRenewal(targetId);
          });

          expect(capturedRenewal.renewals).toEqual(renewalsBefore);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 7
// Validates: Requirements 3.7
describe('Property 7: Query parameters match context filter state', () => {
  it('URL built for GET /api/renewals includes exactly the non-default query params', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          searchQuery: fc.string(),
          statusFilter: fc.constantFrom('all', 'active', 'upcoming', 'overdue', 'due-today'),
          sortConfig: fc.record({
            key: fc.string({ minLength: 1 }),
            direction: fc.constantFrom('asc', 'desc'),
          }),
        }),
        async ({ searchQuery, statusFilter, sortConfig }) => {
          vi.clearAllMocks();

          // Track calls to api.get for /api/renewals
          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: [] });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          let capturedCtx;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(capturedCtx.isLoading).toBe(false);
          });

          // Apply the filter state via context setters, then trigger a re-fetch
          await act(async () => {
            capturedCtx.setSearchQuery(searchQuery);
            capturedCtx.setStatusFilter(statusFilter);
            capturedCtx.setSortConfig(sortConfig);
          });

          // Trigger a refresh so fetchAll runs with the new state
          await act(async () => {
            await capturedCtx.refreshRenewals();
          });

          await waitFor(() => {
            expect(capturedCtx.isLoading).toBe(false);
          });

          // Find the most recent call to api.get('/api/renewals')
          const renewalsCalls = api.get.mock.calls.filter(([url]) => url === '/api/renewals');
          expect(renewalsCalls.length).toBeGreaterThan(0);
          const lastCall = renewalsCalls[renewalsCalls.length - 1];
          const passedParams = lastCall[1]?.params ?? {};

          // Build expected params
          const camelToSnakeLocal = (str) => str.replace(/([A-Z])/g, (l) => `_${l.toLowerCase()}`);
          const expectedParams = {};
          if (searchQuery) expectedParams.search = searchQuery;
          if (statusFilter !== 'all') expectedParams.status = statusFilter;
          expectedParams.sort_by = camelToSnakeLocal(sortConfig.key);
          expectedParams.sort_dir = sortConfig.direction;

          expect(passedParams).toEqual(expectedParams);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 9
// Validates: Requirements 5.2
describe('Property 9: Category addition adds the name to state', () => {
  it('after addCategory(name) resolves, categories contains that name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (name) => {
          api.post.mockResolvedValue({ data: {} });

          let capturedCtx;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedCtx.isLoading).toBe(false);
          });

          await act(async () => {
            await capturedCtx.addCategory(name);
          });

          expect(capturedCtx.categories).toContain(name);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 10
// Validates: Requirements 5.3
describe('Property 10: Category deletion removes the name from state', () => {
  it('after deleteCategory(name) resolves, categories does not contain that name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 })
          .chain((names) => {
            const unique = [...new Set(names)];
            return fc.tuple(
              fc.constant(unique),
              fc.integer({ min: 0, max: unique.length - 1 })
            );
          }),
        async ([categoryList, indexToDelete]) => {
          const targetName = categoryList[indexToDelete];

          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: [] });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: categoryList });
            if (url === '/api/notifications') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: {} });
          });

          api.delete.mockResolvedValue({ data: {} });

          let capturedCtx;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedCtx.isLoading).toBe(false);
          });

          await act(async () => {
            await capturedCtx.deleteCategory(targetName);
          });

          expect(capturedCtx.categories).not.toContain(targetName);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 11
// Validates: Requirements 6.3
describe('Property 11: Marking a notification read only affects that notification', () => {
  it('after markNotificationRead(id), only that notification has read === true; all others are unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({ id: fc.uuid(), read: fc.boolean() }),
          { minLength: 1 }
        ).chain((notifs) => {
          const unique = Array.from(new Map(notifs.map((n) => [n.id, n])).values());
          return fc.tuple(
            fc.constant(unique),
            fc.integer({ min: 0, max: unique.length - 1 })
          );
        }),
        async ([notifList, indexToMark]) => {
          const targetId = notifList[indexToMark].id;

          api.get.mockImplementation((url) => {
            if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
            if (url === '/api/renewals') return Promise.resolve({ data: [] });
            if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
            if (url === '/api/categories') return Promise.resolve({ data: [] });
            if (url === '/api/notifications') return Promise.resolve({ data: notifList });
            return Promise.resolve({ data: {} });
          });

          let capturedCtx;
          await act(async () => {
            render(
              <AuthProvider>
                <RenewalProvider>
                  <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
                </RenewalProvider>
              </AuthProvider>
            );
          });

          await waitFor(() => {
            expect(capturedCtx.isLoading).toBe(false);
          });

          // Snapshot state before marking
          const notifsBefore = capturedCtx.notifications.map((n) => ({ ...n }));

          await act(async () => {
            capturedCtx.markNotificationRead(targetId);
          });

          for (const n of capturedCtx.notifications) {
            if (n.id === targetId) {
              expect(n.read).toBe(true);
            } else {
              const before = notifsBefore.find((b) => b.id === n.id);
              expect(n.read).toBe(before.read);
            }
          }
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Task 5.13
// Validates: Requirements 3.5, 4.3, 6.4

describe('Unit: isLoading transitions', () => {
  it('isLoading is true during fetch and false after it resolves', async () => {
    // Use a deferred promise to control when the API resolves
    let resolveRenewals;
    const deferredRenewals = new Promise((res) => { resolveRenewals = res; });

    api.get.mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { id: 1, name: 'Test User' } });
      if (url === '/api/renewals') return deferredRenewals;
      if (url === '/api/renewals/stats') return Promise.resolve({ data: { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 } });
      if (url === '/api/categories') return Promise.resolve({ data: [] });
      if (url === '/api/notifications') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    // isLoading should be true while the deferred promise is pending
    expect(capturedCtx.isLoading).toBe(true);

    // Resolve the deferred promise
    await act(async () => {
      resolveRenewals({ data: [] });
    });

    // isLoading should be false after fetch completes
    await waitFor(() => {
      expect(capturedCtx.isLoading).toBe(false);
    });
  });
});

describe('Unit: stats re-fetched after renewal mutations', () => {
  it('GET /api/renewals/stats is called again after addRenewal', async () => {
    api.post.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const statsCalls = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;

    await act(async () => {
      await capturedCtx.addRenewal({ name: 'Test', vendor: 'V', amount: 10, billingCycle: 'monthly', renewalDate: '2025-01-01' });
    });

    const statsCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;
    expect(statsCallsAfter).toBeGreaterThan(statsCalls);
  });

  it('GET /api/renewals/stats is called again after updateRenewal', async () => {
    api.put.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const statsCalls = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;

    await act(async () => {
      await capturedCtx.updateRenewal(1, { name: 'Updated', vendor: 'V', amount: 20, billingCycle: 'yearly', renewalDate: '2025-06-01' });
    });

    const statsCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;
    expect(statsCallsAfter).toBeGreaterThan(statsCalls);
  });

  it('GET /api/renewals/stats is called again after deleteRenewal', async () => {
    api.delete.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const statsCalls = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;

    await act(async () => {
      await capturedCtx.deleteRenewal(1);
    });

    const statsCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/renewals/stats').length;
    expect(statsCallsAfter).toBeGreaterThan(statsCalls);
  });
});

describe('Unit: notifications re-fetched after renewal mutations', () => {
  it('GET /api/notifications is called again after addRenewal', async () => {
    api.post.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const notifCalls = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;

    await act(async () => {
      await capturedCtx.addRenewal({ name: 'Test', vendor: 'V', amount: 10, billingCycle: 'monthly', renewalDate: '2025-01-01' });
    });

    const notifCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;
    expect(notifCallsAfter).toBeGreaterThan(notifCalls);
  });

  it('GET /api/notifications is called again after updateRenewal', async () => {
    api.put.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const notifCalls = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;

    await act(async () => {
      await capturedCtx.updateRenewal(1, { name: 'Updated', vendor: 'V', amount: 20, billingCycle: 'yearly', renewalDate: '2025-06-01' });
    });

    const notifCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;
    expect(notifCallsAfter).toBeGreaterThan(notifCalls);
  });

  it('GET /api/notifications is called again after deleteRenewal', async () => {
    api.delete.mockResolvedValue({ data: {} });

    let capturedCtx;
    await act(async () => {
      render(
        <AuthProvider>
          <RenewalProvider>
            <TestComponent capture={(ctx) => { capturedCtx = ctx; }} />
          </RenewalProvider>
        </AuthProvider>
      );
    });

    await waitFor(() => expect(capturedCtx.isLoading).toBe(false));

    const notifCalls = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;

    await act(async () => {
      await capturedCtx.deleteRenewal(1);
    });

    const notifCallsAfter = api.get.mock.calls.filter(([url]) => url === '/api/notifications').length;
    expect(notifCallsAfter).toBeGreaterThan(notifCalls);
  });
});
