import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatePill } from './DatePill';

describe('DatePill', () => {
  const isoDate = '2025-01-15';

  it('renders the formatted date', () => {
    render(<DatePill date={isoDate} daysRemaining={10} />);
    expect(screen.getByText(/Jan 15, 2025/)).toBeTruthy();
  });

  it('shows "in X days" for future dates', () => {
    render(<DatePill date={isoDate} daysRemaining={5} />);
    expect(screen.getByText(/in 5 days/)).toBeTruthy();
  });

  it('shows "in 1 day" (singular) for daysRemaining=1', () => {
    render(<DatePill date={isoDate} daysRemaining={1} />);
    expect(screen.getByText(/in 1 day/)).toBeTruthy();
  });

  it('shows "today" for daysRemaining=0', () => {
    render(<DatePill date={isoDate} daysRemaining={0} />);
    expect(screen.getByText(/today/)).toBeTruthy();
  });

  it('shows "X days ago" for overdue dates', () => {
    render(<DatePill date={isoDate} daysRemaining={-3} />);
    expect(screen.getByText(/3 days ago/)).toBeTruthy();
  });

  it('shows "1 day ago" (singular) for daysRemaining=-1', () => {
    render(<DatePill date={isoDate} daysRemaining={-1} />);
    expect(screen.getByText(/1 day ago/)).toBeTruthy();
  });

  it('applies red color when overdue (daysRemaining < 0)', () => {
    const { container } = render(<DatePill date={isoDate} daysRemaining={-5} />);
    const pill = container.firstChild;
    // jsdom doesn't resolve CSS custom properties, so check the raw style attribute
    expect(pill.getAttribute('style')).toContain('var(--color-status-overdue)');
  });

  it('applies amber color when due-soon (daysRemaining <= 7)', () => {
    const { container } = render(<DatePill date={isoDate} daysRemaining={7} />);
    const pill = container.firstChild;
    expect(pill.getAttribute('style')).toContain('var(--color-status-due-soon)');
  });

  it('applies green color when active (daysRemaining > 7)', () => {
    const { container } = render(<DatePill date={isoDate} daysRemaining={8} />);
    const pill = container.firstChild;
    expect(pill.getAttribute('style')).toContain('var(--color-status-active)');
  });

  it('applies amber color at exactly daysRemaining=0 (today is due-soon tier)', () => {
    const { container } = render(<DatePill date={isoDate} daysRemaining={0} />);
    const pill = container.firstChild;
    expect(pill.getAttribute('style')).toContain('var(--color-status-due-soon)');
  });

  it('has an accessible aria-label', () => {
    render(<DatePill date={isoDate} daysRemaining={10} />);
    const pill = screen.getByLabelText(/Due Jan 15, 2025/);
    expect(pill).toBeTruthy();
  });

  it('accepts a Date object as the date prop', () => {
    render(<DatePill date={new Date('2025-06-01')} daysRemaining={30} />);
    expect(screen.getByText(/Jun 1, 2025/)).toBeTruthy();
  });
});
