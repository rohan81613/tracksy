import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock api module
vi.mock('../../api.js', () => ({
  default: {
    post: vi.fn(),
  },
  toSnake: vi.fn((obj) => {
    // Real toSnake implementation for accurate payload testing
    function camelToSnakeStr(str) {
      return str.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
    }
    function toSnake(o) {
      if (o === null || o === undefined) return o;
      if (Array.isArray(o)) return o.map(toSnake);
      if (typeof o !== 'object') return o;
      return Object.fromEntries(
        Object.entries(o).map(([key, value]) => [camelToSnakeStr(key), toSnake(value)])
      );
    }
    return toSnake(obj);
  }),
}));

// Mock RenewalContext
const mockRefreshRenewals = vi.fn();
const mockSetCurrentPage = vi.fn();

vi.mock('../../context/RenewalContext.jsx', () => ({
  useRenewal: () => ({
    refreshRenewals: mockRefreshRenewals,
    setCurrentPage: mockSetCurrentPage,
  }),
}));

// Mock AuthContext
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User', email: 'test@example.com' },
  }),
}));

import api from '../../api.js';
import ImportModal from './ImportModal.jsx';

// A minimal valid CSV with the required columns
const VALID_CSV = `Name,Vendor,Amount,Billing Cycle,Renewal Date
Netflix,Netflix Inc.,15.99,monthly,2025-06-01
AWS,Amazon,240.00,yearly,2025-07-15`;

/**
 * Helper: render ImportModal and drive it to the preview step.
 * Returns the rendered container so callers can interact further.
 */
async function renderAtPreviewStep() {
  render(<ImportModal isOpen={true} onClose={vi.fn()} />);

  // Step 1: Upload — simulate file drop/input
  const fileInput = document.querySelector('input[type="file"]');
  const file = new File([VALID_CSV], 'renewals.csv', { type: 'text/csv' });

  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
  });

  // Should now be on the Map step — wait for "Preview Data" button
  await waitFor(() => {
    expect(screen.getByText('Preview Data')).toBeInTheDocument();
  });

  // Step 2: Map — click "Preview Data"
  await act(async () => {
    fireEvent.click(screen.getByText('Preview Data'));
  });

  // Should now be on the Preview step
  await waitFor(() => {
    expect(screen.getByText(/Import \d+ Renewal/)).toBeInTheDocument();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRefreshRenewals.mockResolvedValue(undefined);
});

// ─── Test: calls POST /api/renewals/import with correct snake_case payload ────
// Validates: Requirements 7.1
describe('ImportModal — POST /api/renewals/import payload', () => {
  it('calls POST /api/renewals/import with snake_case keys and no internal fields', async () => {
    api.post.mockResolvedValue({ data: {} });

    await renderAtPreviewStep();

    // Click the Import button
    const importBtn = screen.getByText(/Import \d+ Renewal/);
    await act(async () => {
      fireEvent.click(importBtn);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/renewals/import',
        expect.objectContaining({ renewals: expect.any(Array) })
      );
    });

    const [, payload] = api.post.mock.calls[0];
    const renewals = payload.renewals;

    // Should have 2 rows (both valid)
    expect(renewals).toHaveLength(2);

    // Each item must use snake_case keys
    for (const item of renewals) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('vendor');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('billing_cycle');
      expect(item).toHaveProperty('renewal_date');
      expect(item).toHaveProperty('reminder_days');

      // Internal fields must be stripped
      expect(item).not.toHaveProperty('id');
      expect(item).not.toHaveProperty('_dateValid');
      expect(item).not.toHaveProperty('_amountValid');

      // No camelCase keys
      expect(item).not.toHaveProperty('billingCycle');
      expect(item).not.toHaveProperty('renewalDate');
      expect(item).not.toHaveProperty('reminderDays');
    }

    // Verify first row values
    expect(renewals[0].name).toBe('Netflix');
    expect(renewals[0].vendor).toBe('Netflix Inc.');
    expect(renewals[0].amount).toBeCloseTo(15.99);
    expect(renewals[0].billing_cycle).toBe('monthly');
    expect(renewals[0].renewal_date).toBe('2025-06-01');
  });

  it('calls refreshRenewals and advances to done step on success', async () => {
    api.post.mockResolvedValue({ data: {} });

    await renderAtPreviewStep();

    const importBtn = screen.getByText(/Import \d+ Renewal/);
    await act(async () => {
      fireEvent.click(importBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Import Successful!')).toBeInTheDocument();
    });

    expect(mockRefreshRenewals).toHaveBeenCalledOnce();
  });
});

// ─── Test: displays backend validation errors when import returns 422 ─────────
// Validates: Requirements 7.3
describe('ImportModal — 422 validation error display', () => {
  it('shows an error message and stays on preview step when import returns 422', async () => {
    // Simulate a 422 error as thrown by the api.js interceptor
    const validationError = new Error('Validation failed');
    validationError.errors = {
      'renewals.0.name': ['The name field is required.'],
    };
    api.post.mockRejectedValue(validationError);

    await renderAtPreviewStep();

    const importBtn = screen.getByText(/Import \d+ Renewal/);
    await act(async () => {
      fireEvent.click(importBtn);
    });

    // Error message should be visible
    await waitFor(() => {
      expect(
        screen.getByText(/some rows failed validation/i)
      ).toBeInTheDocument();
    });

    // Should NOT have advanced to the done step
    expect(screen.queryByText('Import Successful!')).not.toBeInTheDocument();

    // Import button should still be present (still on preview step)
    expect(screen.getByText(/Import \d+ Renewal/)).toBeInTheDocument();

    // refreshRenewals should NOT have been called
    expect(mockRefreshRenewals).not.toHaveBeenCalled();
  });

  it('shows a generic error message for non-422 errors', async () => {
    api.post.mockRejectedValue(new Error('Network failure'));

    await renderAtPreviewStep();

    const importBtn = screen.getByText(/Import \d+ Renewal/);
    await act(async () => {
      fireEvent.click(importBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeInTheDocument();
    });

    expect(screen.queryByText('Import Successful!')).not.toBeInTheDocument();
  });
});
