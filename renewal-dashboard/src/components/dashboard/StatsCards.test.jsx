import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import StatsCards from './StatsCards.jsx';
import { formatCurrency } from '../../utils/renewalUtils.js';

// Feature: backend-continuation, Property 8
// Validates: Requirements 4.2
describe('Property 8: StatsCards renders all four stat values', () => {
  it('for any non-negative { total, upcoming, overdue, monthlySpend }, all four values appear in the output', () => {
    fc.assert(
      fc.property(
        fc.record({
          total: fc.nat(),
          upcoming: fc.nat(),
          overdue: fc.nat(),
          monthlySpend: fc.float({ min: 0, max: 1e6, noNaN: true }),
        }),
        (stats) => {
          const noop = vi.fn();
          const { container } = render(
            <StatsCards
              stats={stats}
              isLoading={false}
              activeCard={null}
              onCardClick={noop}
            />
          );
          const text = container.textContent;

          // total and upcoming and overdue are rendered as plain numbers
          expect(text).toContain(String(stats.total));
          expect(text).toContain(String(stats.upcoming));
          expect(text).toContain(String(stats.overdue));

          // monthlySpend is rendered via formatCurrency
          const formatted = formatCurrency(stats.monthlySpend);
          expect(text).toContain(formatted);
        }
      ),
      { numRuns: 5 }
    );
  });
});
