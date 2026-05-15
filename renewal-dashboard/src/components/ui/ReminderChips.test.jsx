import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReminderChips } from './ReminderChips';

describe('ReminderChips', () => {
  // ── Preset chips ──────────────────────────────────────────────────────────

  it('renders all 5 preset chips', () => {
    render(<ReminderChips value={[]} onChange={() => {}} />);
    [30, 15, 7, 3, 1].forEach((days) => {
      const label = days === 1 ? '1 day' : `${days} days`;
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument();
    });
  });

  it('marks preset chips as selected when their value is in the value prop', () => {
    render(<ReminderChips value={[7, 30]} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /^7 days/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^15 days/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the chip added when an unselected preset is clicked', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[7]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^30 days/i }));
    expect(onChange).toHaveBeenCalledWith([30, 7]);
  });

  it('calls onChange with the chip removed when a selected preset is clicked', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[30, 7]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^30 days/i }));
    expect(onChange).toHaveBeenCalledWith([7]);
  });

  it('removes a chip when its × button is clicked', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[7]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /remove 7 days/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  // ── Custom input ──────────────────────────────────────────────────────────

  it('adds a custom value when the + button is clicked', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: /add custom reminder/i }));
    expect(onChange).toHaveBeenCalledWith([14]);
  });

  it('adds a custom value when Enter is pressed in the input', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '21' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([21]);
  });

  it('shows an error for a non-positive input', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /add custom reminder/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows an error when the custom value is already selected', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[14]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: /add custom reminder/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the input after a successful custom add', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: /add custom reminder/i }));
    expect(input.value).toBe('');
  });

  // ── Sorting ───────────────────────────────────────────────────────────────

  it('keeps the selected array sorted descending after adding', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[7]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^30 days/i }));
    expect(onChange).toHaveBeenCalledWith([30, 7]);
  });

  it('sorts custom values descending alongside presets', () => {
    const onChange = vi.fn();
    render(<ReminderChips value={[30, 7]} onChange={onChange} />);
    const input = screen.getByRole('spinbutton', { name: /custom reminder days/i });
    fireEvent.change(input, { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: /add custom reminder/i }));
    expect(onChange).toHaveBeenCalledWith([30, 14, 7]);
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('renders without crashing when value is undefined', () => {
    render(<ReminderChips onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('shows custom chips for values not in the preset list', () => {
    render(<ReminderChips value={[14, 60]} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /remove 14 days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove 60 days/i })).toBeInTheDocument();
  });
});
