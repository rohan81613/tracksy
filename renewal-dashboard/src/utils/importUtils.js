import { v4 as uuidv4 } from 'uuid';
import { format, parse, isValid } from 'date-fns';

// ─── CSV Parser ───────────────────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('File must have a header row and at least one data row.');

  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim().replace(/^"|"$/g, '');
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Auto-detect column mapping ───────────────────────────────────────────────
const FIELD_ALIASES = {
  name:         ['name', 'service', 'service_name', 'subscription', 'product', 'app', 'tool'],
  vendor:       ['vendor', 'company', 'provider', 'supplier', 'brand', 'publisher'],
  amount:       ['amount', 'price', 'cost', 'fee', 'charge', 'payment', 'value', 'total'],
  billingCycle: ['billing_cycle', 'billing', 'cycle', 'frequency', 'period', 'interval', 'plan'],
  renewalDate:  ['renewal_date', 'renewal', 'due_date', 'expiry', 'expiry_date', 'expiration', 'next_renewal', 'date', 'end_date'],
  reminderDays: ['reminder_days', 'reminder', 'alert', 'notify', 'days_before', 'advance_notice'],
  category:     ['category', 'type', 'tag', 'group', 'department', 'team'],
  notes:        ['notes', 'note', 'description', 'comment', 'remarks', 'details'],
};

export function autoDetectMapping(headers) {
  const mapping = {};
  headers.forEach(h => {
    const normalized = h.toLowerCase().replace(/\s+/g, '_');
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized) && !mapping[field]) {
        mapping[field] = h;
      }
    }
  });
  return mapping;
}

// ─── Date normalizer ──────────────────────────────────────────────────────────
const DATE_FORMATS = [
  'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MM-dd-yyyy',
  'dd-MM-yyyy', 'MMMM d, yyyy', 'MMM d, yyyy', 'dd MMM yyyy',
  'yyyy/MM/dd', 'M/d/yyyy', 'd/M/yyyy',
];

export function normalizeDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Excel serial number
  if (/^\d{5}$/.test(str)) {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + parseInt(str) * 86400000);
    if (isValid(d)) return format(d, 'yyyy-MM-dd');
  }
  for (const fmt of DATE_FORMATS) {
    try {
      const d = parse(str, fmt, new Date());
      if (isValid(d)) return format(d, 'yyyy-MM-dd');
    } catch {}
  }
  return null;
}

// ─── Billing cycle normalizer ─────────────────────────────────────────────────
export function normalizeBillingCycle(raw) {
  if (!raw) return 'monthly';
  const v = String(raw).toLowerCase().trim();
  if (['yearly', 'annual', 'annually', 'year', 'per year', '12 months', 'pa'].some(x => v.includes(x))) return 'yearly';
  return 'monthly';
}

// ─── Row → Renewal ────────────────────────────────────────────────────────────
export function rowToRenewal(row, mapping) {
  const get = (field) => {
    const col = mapping[field];
    return col ? (row[col] || row[col.toLowerCase().replace(/\s+/g, '_')] || '') : '';
  };

  const rawDate = get('renewalDate');
  const renewalDate = normalizeDate(rawDate);
  const rawAmount = get('amount');
  const amount = parseFloat(String(rawAmount).replace(/[^0-9.]/g, '')) || 0;
  const reminderRaw = get('reminderDays');
  const reminderDays = parseInt(reminderRaw) || 7;

  return {
    id: uuidv4(),
    name: get('name') || 'Unnamed',
    vendor: get('vendor') || get('name') || 'Unknown',
    amount,
    billingCycle: normalizeBillingCycle(get('billingCycle')),
    renewalDate: renewalDate || format(new Date(), 'yyyy-MM-dd'),
    reminderDays,
    category: get('category') || '',
    notes: get('notes') || '',
    _dateValid: !!renewalDate,
    _amountValid: amount > 0,
  };
}

// ─── Validate imported row ────────────────────────────────────────────────────
export function validateImportRow(renewal) {
  const errors = [];
  if (!renewal.name || renewal.name === 'Unnamed') errors.push('Missing name');
  if (!renewal._amountValid) errors.push('Invalid amount');
  if (!renewal._dateValid) errors.push('Invalid date');
  return errors;
}

// ─── Generate sample CSV ──────────────────────────────────────────────────────
export function generateSampleCSV() {
  const rows = [
    ['Name', 'Vendor', 'Amount', 'Billing Cycle', 'Renewal Date', 'Reminder Days', 'Category', 'Notes'],
    ['Netflix', 'Netflix Inc.', '15.99', 'monthly', '2025-06-01', '7', 'Entertainment', 'Streaming service'],
    ['AWS', 'Amazon Web Services', '240.00', 'monthly', '2025-07-15', '14', 'Infrastructure', 'Cloud hosting'],
    ['Figma', 'Figma Inc.', '144.00', 'yearly', '2025-08-20', '30', 'Design', 'Design tool'],
    ['Slack', 'Salesforce', '87.50', 'monthly', '2025-05-10', '7', 'Communication', 'Team messaging'],
  ];
  return rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
}
