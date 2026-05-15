import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import StatsCards from './StatsCards.jsx';
import { formatCurrency } from '../../utils/renewalUtils.js';

// Mock RenewalContext so StatsCards can be rendered in isolation
vi.mock('../../context/RenewalContext', () => ({
  useRenewal: vi.fn(),
}));

import { useRenewal } from '../../context/RenewalContext';

// Feature: tracksy-redesign, Task 3.2
// Validates: Requirements 3.1, 3.2
describe('StatsCards — 5 KPI cards', () => {
  it('renders all 5 KPI card labels', () => {
    useRenewal.mockReturnValue({
      stats: { totalActive: 10, dueIn7Days: 2, overdue: 1, monthlySpend: 500, annualProjected: 6000 },
      isLoading: false,
      setCurrentPage: vi.fn(),
      setStatusFilter: vi.fn(),
    });

    const { container } = render(<StatsCards />);
    const text = container.textContent;

    expect(text).toMatch(/Total Active Renewals/i);
    expect(text).toMatch(/Due in 7 Days/i);
    expect(text).toMatch(/Overdue/i);
    expect(text).toMatch(/Monthly Recurring Spend/i);
    expect(text).toMatch(/Annual Projected Spend/i);
  });

  it('shows skeleton cards when isLoading is true', () => {
    useRenewal.mockReturnValue({
      stats: null,
      isLoading: true,
      setCurrentPage: vi.fn(),
      setStatusFilter: vi.fn(),
    });

    const { container } = render(<StatsCards />);
    // KpiCard renders SkeletonLine elements when loading
    const skeletonLines = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletonLines.length).toBeGreaterThan(0);
  });
});

// Feature: tracksy-redesign, Task 3.2 — Property test
// Validates: Requirements 3.1, 3.2
describe('Property: StatsCards renders all 5 stat values for any valid stats object', () => {
  it('for any non-negative stats, all 5 values appear in the output', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalActive:     fc.nat(),
          dueIn7Days:      fc.nat(),
          overdue:         fc.nat(),
          monthlySpend:    fc.float({ min: 0, max: 1e6, noNaN: true }),
          annualProjected: fc.float({ min: 0, max: 1e7, noNaN: true }),
        }),
        (stats) => {
          useRenewal.mockReturnValue({
            stats,
            isLoading: false,
            setCurrentPage: vi.fn(),
            setStatusFilter: vi.fn(),
          });

          const { container } = render(<StatsCards />);
          const text = container.textContent;

          expect(text).toContain(String(stats.totalActive));
          expect(text).toContain(String(stats.dueIn7Days));
          expect(text).toContain(String(stats.overdue));
          expect(text).toContain(formatCurrency(stats.monthlySpend));
          expect(text).toContain(formatCurrency(stats.annualProjected));
        }
      ),
      { numRuns: 5 }
    );
  });
});
