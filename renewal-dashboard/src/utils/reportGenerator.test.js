import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jsPDF before importing reportGenerator
vi.mock('jspdf', () => {
  const mockDoc = {
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    rect: vi.fn(),
    circle: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn((text) => [String(text)]),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    setPage: vi.fn(),
    setLineWidth: vi.fn(),
    save: vi.fn(),
  };
  return {
    jsPDF: vi.fn(() => mockDoc),
  };
});

// Mock URL and document APIs used by downloadCSV
global.URL.createObjectURL = vi.fn(() => 'blob:mock');
global.URL.revokeObjectURL = vi.fn();

import { generateCSV, downloadCSV, downloadPDFReport } from './reportGenerator.js';

const CSV_HEADER = 'name,vendor,amount,billingCycle,renewalDate,status,category,notes';

const sampleRenewal = {
  name: 'GitHub',
  vendor: 'GitHub Inc',
  amount: 99,
  billingCycle: 'yearly',
  renewalDate: '2099-12-31', // far future → 'active'
  status: 'active',
  category: 'Dev Tools',
  notes: 'Team plan',
};

describe('generateCSV', () => {
  it('returns only the header row for an empty array', () => {
    const csv = generateCSV([]);
    expect(csv).toBe(CSV_HEADER);
  });

  it('does not throw for an empty array', () => {
    expect(() => generateCSV([])).not.toThrow();
  });

  it('returns header + one data row for a single renewal', () => {
    const csv = generateCSV([sampleRenewal]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(CSV_HEADER);
  });

  it('includes the correct number of data rows for multiple renewals', () => {
    const renewals = [sampleRenewal, { ...sampleRenewal, name: 'Slack' }];
    const csv = generateCSV(renewals);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it('includes all required columns in each data row', () => {
    const csv = generateCSV([sampleRenewal]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    expect(dataRow).toContain('GitHub');
    expect(dataRow).toContain('GitHub Inc');
    expect(dataRow).toContain('99');
    expect(dataRow).toContain('yearly');
    expect(dataRow).toContain('2099-12-31');
    expect(dataRow).toContain('Dev Tools');
    expect(dataRow).toContain('Team plan');
  });

  it('escapes values containing commas', () => {
    const renewal = { ...sampleRenewal, name: 'Acme, Inc' };
    const csv = generateCSV([renewal]);
    expect(csv).toContain('"Acme, Inc"');
  });

  it('escapes values containing double quotes', () => {
    const renewal = { ...sampleRenewal, notes: 'He said "hello"' };
    const csv = generateCSV([renewal]);
    expect(csv).toContain('"He said ""hello"""');
  });

  it('handles null/undefined fields gracefully', () => {
    const renewal = { ...sampleRenewal, category: null, notes: undefined };
    expect(() => generateCSV([renewal])).not.toThrow();
    const csv = generateCSV([renewal]);
    expect(csv.split('\n')).toHaveLength(2);
  });
});

describe('downloadCSV', () => {
  beforeEach(() => {
    // Mock DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  it('does not throw for an empty renewals array', () => {
    expect(() => downloadCSV([])).not.toThrow();
  });

  it('does not throw for a non-empty renewals array', () => {
    expect(() => downloadCSV([sampleRenewal])).not.toThrow();
  });

  it('triggers a file download by clicking a link', () => {
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    downloadCSV([sampleRenewal]);
    expect(mockLink.click).toHaveBeenCalled();
  });
});

describe('downloadPDFReport', () => {
  it('does not throw for an empty renewals array', () => {
    expect(() => downloadPDFReport([])).not.toThrow();
  });

  it('does not throw for a non-empty renewals array', () => {
    expect(() => downloadPDFReport([sampleRenewal])).not.toThrow();
  });

  it('calls jsPDF save for an empty array', async () => {
    const { jsPDF } = await import('jspdf');
    const mockInstance = jsPDF.mock.results[jsPDF.mock.results.length - 1]?.value;
    downloadPDFReport([]);
    const latestInstance = jsPDF.mock.results[jsPDF.mock.results.length - 1]?.value;
    expect(latestInstance.save).toHaveBeenCalled();
  });

  it('calls jsPDF save for a non-empty array', async () => {
    const { jsPDF } = await import('jspdf');
    downloadPDFReport([sampleRenewal]);
    const latestInstance = jsPDF.mock.results[jsPDF.mock.results.length - 1]?.value;
    expect(latestInstance.save).toHaveBeenCalled();
  });
});
