import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { toCamel, toSnake } from './api.js';

describe('toCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    expect(toCamel({ billing_cycle: 'monthly', renewal_date: '2025-01-01' }))
      .toEqual({ billingCycle: 'monthly', renewalDate: '2025-01-01' });
  });

  it('handles nested objects', () => {
    expect(toCamel({ outer_key: { inner_key: 'value' } }))
      .toEqual({ outerKey: { innerKey: 'value' } });
  });

  it('handles arrays of objects', () => {
    expect(toCamel([{ reminder_days: 7 }, { monthly_amount: 9.99 }]))
      .toEqual([{ reminderDays: 7 }, { monthlyAmount: 9.99 }]);
  });

  it('returns primitives as-is', () => {
    expect(toCamel(42)).toBe(42);
    expect(toCamel('hello')).toBe('hello');
    expect(toCamel(true)).toBe(true);
  });

  it('returns null and undefined as-is', () => {
    expect(toCamel(null)).toBeNull();
    expect(toCamel(undefined)).toBeUndefined();
  });

  it('converts days_until_renewal correctly', () => {
    expect(toCamel({ days_until_renewal: 30 })).toEqual({ daysUntilRenewal: 30 });
  });
});

describe('toSnake', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(toSnake({ billingCycle: 'monthly', renewalDate: '2025-01-01' }))
      .toEqual({ billing_cycle: 'monthly', renewal_date: '2025-01-01' });
  });

  it('handles nested objects', () => {
    expect(toSnake({ outerKey: { innerKey: 'value' } }))
      .toEqual({ outer_key: { inner_key: 'value' } });
  });

  it('handles arrays of objects', () => {
    expect(toSnake([{ reminderDays: 7 }, { monthlyAmount: 9.99 }]))
      .toEqual([{ reminder_days: 7 }, { monthly_amount: 9.99 }]);
  });

  it('returns primitives as-is', () => {
    expect(toSnake(42)).toBe(42);
    expect(toSnake('hello')).toBe('hello');
    expect(toSnake(true)).toBe(true);
  });

  it('returns null and undefined as-is', () => {
    expect(toSnake(null)).toBeNull();
    expect(toSnake(undefined)).toBeUndefined();
  });
});

// Feature: backend-continuation, Property 1
// Validates: Requirements 1.2, 3.2, 3.3, 3.4
describe('Property 1: camelCase mapper is a round-trip with the snake_case mapper', () => {
  it('toCamel(toSnake(obj)) deeply equals the original object for arbitrary flat objects', () => {
    // Keys must be valid camelCase identifiers for the round-trip to hold:
    // starts with a lowercase letter, followed by alphanumeric or camelCase segments
    const camelCaseKey = fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/);
    fc.assert(
      fc.property(
        fc.dictionary(
          camelCaseKey,
          fc.oneof(fc.string(), fc.integer(), fc.boolean())
        ),
        (obj) => {
          expect(toCamel(toSnake(obj))).toEqual(obj);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// ─── Unit tests for api.js interceptors ───────────────────────────────────────
// Validates: Requirements 1.3, 1.4, 1.5, 11.4

import api from './api.js';

describe('api.js — Axios instance', () => {
  it('baseURL falls back to http://localhost:8000 when VITE_API_URL is unset', () => {
    // import.meta.env.VITE_API_URL is undefined in the test environment,
    // so the ?? fallback should be used.
    expect(api.defaults.baseURL).toBe('http://localhost:8000');
  });
});

describe('api.js — response interceptor (error handler)', () => {
  // Grab the error handler registered as the second argument of the response interceptor.
  // Vitest/jsdom exposes the handlers via the internal manager.
  const errorHandler = api.interceptors.response.handlers[0].rejected;

  beforeEach(() => {
    localStorage.clear();
    // Reset location between tests
    delete window.location;
    window.location = { href: '' };
  });

  it('401 clears tracksy_token from localStorage and sets window.location.href', async () => {
    localStorage.setItem('tracksy_token', 'test-token');

    const error = {
      response: { status: 401, data: {} },
    };

    await expect(() => errorHandler(error)).toThrow();

    expect(localStorage.getItem('tracksy_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('422 re-throws an Error with .errors matching the backend payload', async () => {
    const backendErrors = { email: ['The email has already been taken.'] };
    const error = {
      response: {
        status: 422,
        data: { message: 'Validation failed', errors: backendErrors },
      },
    };

    let thrown;
    try {
      errorHandler(error);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.errors).toEqual(backendErrors);
  });

  it('network error (no response) re-throws { message, type: "network" }', async () => {
    const error = { message: 'Network Error' }; // no .response property

    let thrown;
    try {
      errorHandler(error);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toEqual({ message: 'Unable to reach server', type: 'network' });
  });
});

// Feature: backend-continuation, Property 2
// Validates: Requirements 1.2
describe('Property 2: Auth token is attached to every request when present', () => {
  const requestFulfilled = api.interceptors.request.handlers[0].fulfilled;

  beforeEach(() => {
    localStorage.clear();
  });

  it('sets Authorization: Bearer {token} for any non-empty token string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (token) => {
          localStorage.setItem('tracksy_token', token);
          const config = { headers: {} };
          const result = requestFulfilled(config);
          expect(result.headers.Authorization).toBe(`Bearer ${token}`);
        }
      ),
      { numRuns: 5 }
    );
  });
});

// Feature: backend-continuation, Property 3
// Validates: Requirements 1.4
describe('Property 3: Validation errors pass through unchanged', () => {
  const errorHandler = api.interceptors.response.handlers[0].rejected;

  it('re-thrown error .errors deeply equals the original errors object for any 422 payload', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1 }), fc.array(fc.string(), { minLength: 1 })),
        (errors) => {
          const error = {
            response: {
              status: 422,
              data: { message: 'Validation failed', errors },
            },
          };

          let thrown;
          try {
            errorHandler(error);
          } catch (e) {
            thrown = e;
          }

          expect(thrown).toBeInstanceOf(Error);
          expect(thrown.errors).toEqual(errors);
        }
      ),
      { numRuns: 5 }
    );
  });
});
