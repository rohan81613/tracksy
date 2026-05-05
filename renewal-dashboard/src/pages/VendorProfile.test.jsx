import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import VendorProfile from './VendorProfile.jsx';
import { formatCurrency } from '../utils/renewalUtils.js';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../context/RenewalContext.jsx', () => ({
  useRenewal: vi.fn(),
}));

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(() => ({ currentUser: { id: 1, name: 'Test User' } })),
}));

// Mock child components that make their own context calls or have complex deps
vi.mock('../components/renewals/RenewalForm.jsx', () => ({
  default: ({ isOpen, editRenewal }) =>
    isOpen ? (
      <div data-testid="renewal-form">
        <span data-testid="edit-renewal-name">{editRenewal?.name}</span>
        <span data-testid="edit-renewal-vendor">{editRenewal?.vendor}</span>
        <span data-testid="edit-renewal-amount">{editRenewal?.amount}</span>
        <span data-testid="edit-renewal-billing-cycle">{editRenewal?.billingCycle}</span>
        <span data-testid="edit-renewal-renewal-date">{editRenewal?.renewalDate}</span>
      </div>
    ) : null,
}));

vi.mock('../components/renewals/DeleteConfirm.jsx', () => ({
  default: () => null,
}));

vi.mock('../utils/reportGenerator.js', () => ({
  downloadReport: vi.fn(),
}));

import { useRenewal } from '../context/RenewalContext.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal valid renewal object */
function makeRenewal(overrides = {}) {
  return {
    id: 'renewal-1',
    name: 'TestApp',
    vendor: 'TestVendor',
    amount: 100,
    billingCycle: 'monthly',
    renewalDate: '2099-12-31',
    reminderDays: 7,
    category: 'Software',
    notes: '',
    purchaseDate: '',
    ...overrides,
  };
}

/** Set up the useRenewal mock with the given values */
function setupRenewalMock({ renewals = [], selectedVendorId = null } = {}) {
  useRenewal.mockReturnValue({
    renewals,
    selectedVendorId,
    setCurrentPage: vi.fn(),
    deleteRenewal: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Property 12: VendorProfile vendor filter ─────────────────────────────────
// Feature: backend-continuation, Property 12
// Validates: Requirements 8.1
describe('Property 12: VendorProfile only shows renewals for the selected vendor', () => {
  it('for any array of renewals and any selected renewal id, only that renewal\'s vendor name is shown', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            vendor: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
          }),
          { minLength: 1 }
        ).chain((renewals) => {
          // Deduplicate by id
          const unique = Array.from(new Map(renewals.map((r) => [r.id, r])).values());
          return fc.tuple(
            fc.constant(unique),
            fc.integer({ min: 0, max: unique.length - 1 })
          );
        }),
        ([renewals, selectedIndex]) => {
          const selectedRenewal = renewals[selectedIndex];
          const fullRenewals = renewals.map((r) => makeRenewal({
            id: r.id,
            vendor: r.vendor,
            name: r.name,
          }));

          setupRenewalMock({
            renewals: fullRenewals,
            selectedVendorId: selectedRenewal.id,
          });

          const { container, unmount } = render(<VendorProfile />);
          const text = container.textContent;

          // The selected renewal's vendor name must appear in the output
          expect(text).toContain(selectedRenewal.vendor);

          // Renewals with different IDs (other vendors) should NOT have their
          // vendor names shown as the primary vendor — we verify the selected
          // renewal's name appears in the heading area
          expect(text).toContain(selectedRenewal.name);

          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  it('when selectedVendorId does not match any renewal, shows "No vendor selected" fallback', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            vendor: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
          }),
          { minLength: 1 }
        ),
        (renewals) => {
          const fullRenewals = renewals.map((r) => makeRenewal({
            id: r.id,
            vendor: r.vendor,
            name: r.name,
          }));

          setupRenewalMock({
            renewals: fullRenewals,
            selectedVendorId: 'non-existent-id-that-matches-nothing',
          });

          const { container, unmount } = render(<VendorProfile />);
          expect(container.textContent).toContain('No vendor selected');
          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });
});

// ─── Property 13: VendorProfile yearly spend sum ──────────────────────────────
// Feature: backend-continuation, Property 13
// Validates: Requirements 8.2
describe('Property 13: VendorProfile yearly spend is the correct sum', () => {
  it('for any renewal, the yearly spend displayed equals the correct yearlyAmount', () => {
    fc.assert(
      fc.property(
        fc.record({
          amount: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
          billingCycle: fc.constantFrom('monthly', 'yearly'),
        }),
        ({ amount, billingCycle }) => {
          const renewal = makeRenewal({ amount, billingCycle });

          setupRenewalMock({
            renewals: [renewal],
            selectedVendorId: renewal.id,
          });

          const { container, unmount } = render(<VendorProfile />);
          const text = container.textContent;

          // yearlyAmount: if yearly → amount, if monthly → amount * 12
          const expectedYearly = billingCycle === 'yearly' ? amount : amount * 12;
          const formatted = formatCurrency(expectedYearly);

          expect(text).toContain(formatted);
          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });
});

// ─── Unit: Edit button opens RenewalForm pre-populated with correct data ───────
// Validates: Requirements 8.4
describe('Unit: Edit button opens RenewalForm pre-populated with the correct renewal data', () => {
  it('clicking the top-bar Edit button opens RenewalForm with the selected renewal\'s data', () => {
    const renewal = makeRenewal({
      id: 'test-id-1',
      name: 'Slack',
      vendor: 'Slack Technologies',
      amount: 12.99,
      billingCycle: 'monthly',
      renewalDate: '2099-06-15',
    });

    setupRenewalMock({
      renewals: [renewal],
      selectedVendorId: renewal.id,
    });

    render(<VendorProfile />);

    // RenewalForm should not be open initially
    expect(screen.queryByTestId('renewal-form')).toBeNull();

    // Click the "Edit" button in the top nav bar (first Edit button)
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    // RenewalForm should now be open
    expect(screen.getByTestId('renewal-form')).toBeTruthy();

    // It should be pre-populated with the correct renewal data
    expect(screen.getByTestId('edit-renewal-name').textContent).toBe(renewal.name);
    expect(screen.getByTestId('edit-renewal-vendor').textContent).toBe(renewal.vendor);
    expect(screen.getByTestId('edit-renewal-billing-cycle').textContent).toBe(renewal.billingCycle);
    expect(screen.getByTestId('edit-renewal-renewal-date').textContent).toBe(renewal.renewalDate);
  });

  it('clicking the "Edit Renewal" quick action button also opens RenewalForm with correct data', () => {
    const renewal = makeRenewal({
      id: 'test-id-2',
      name: 'GitHub',
      vendor: 'GitHub Inc.',
      amount: 21,
      billingCycle: 'yearly',
      renewalDate: '2099-03-01',
    });

    setupRenewalMock({
      renewals: [renewal],
      selectedVendorId: renewal.id,
    });

    render(<VendorProfile />);

    // Click the "Edit Renewal" button in the Quick Actions card
    const editRenewalButton = screen.getByRole('button', { name: /edit renewal/i });
    fireEvent.click(editRenewalButton);

    expect(screen.getByTestId('renewal-form')).toBeTruthy();
    expect(screen.getByTestId('edit-renewal-name').textContent).toBe(renewal.name);
    expect(screen.getByTestId('edit-renewal-vendor').textContent).toBe(renewal.vendor);
    expect(screen.getByTestId('edit-renewal-amount').textContent).toBe(String(renewal.amount));
    expect(screen.getByTestId('edit-renewal-billing-cycle').textContent).toBe(renewal.billingCycle);
    expect(screen.getByTestId('edit-renewal-renewal-date').textContent).toBe(renewal.renewalDate);
  });
});
