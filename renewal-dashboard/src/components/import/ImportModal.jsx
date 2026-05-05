import { useState, useRef, useCallback } from 'react';
import {
  HiUpload, HiX, HiDocumentText, HiCheckCircle, HiExclamationCircle,
  HiDownload, HiRefresh, HiChevronRight, HiTable, HiCheck,
} from 'react-icons/hi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useRenewal } from '../../context/RenewalContext';
import api, { toSnake } from '../../api.js';
import {
  parseCSV, autoDetectMapping, rowToRenewal,
  validateImportRow, generateSampleCSV,
} from '../../utils/importUtils';

const STEPS = ['upload', 'map', 'preview', 'done'];

const REQUIRED_FIELDS = ['name', 'amount', 'renewalDate'];
const ALL_FIELDS = [
  { key: 'name',         label: 'Name',          required: true  },
  { key: 'vendor',       label: 'Vendor',         required: false },
  { key: 'amount',       label: 'Amount',         required: true  },
  { key: 'billingCycle', label: 'Billing Cycle',  required: false },
  { key: 'renewalDate',  label: 'Renewal Date',   required: true  },
  { key: 'reminderDays', label: 'Reminder Days',  required: false },
  { key: 'category',     label: 'Category',       required: false },
  { key: 'notes',        label: 'Notes',          required: false },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  const labels = ['Upload', 'Map Columns', 'Preview', 'Done'];
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-0 mb-6">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < idx ? 'bg-blue-600 text-white' :
              i === idx ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < idx ? <HiCheck size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i <= idx ? 'text-blue-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < idx ? 'bg-blue-600' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Upload step ──────────────────────────────────────────────────────────────
function UploadStep({ onParsed }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError('');
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt'].includes(ext)) {
      setError('Please upload a CSV file (.csv or .txt).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseCSV(e.target.result);
        if (result.rows.length === 0) { setError('No data rows found in file.'); return; }
        onParsed(result, file.name);
      } catch (err) {
        setError(err.message || 'Failed to parse file.');
      }
    };
    reader.readAsText(file);
  }, [onParsed]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const downloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tracksy-sample-import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <HiUpload className={dragging ? 'text-blue-600' : 'text-gray-400'} size={28} />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          {dragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
        </p>
        <p className="text-xs text-gray-400 mb-4">or click to browse</p>
        <span className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Browse File
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
          <HiExclamationCircle className="text-red-500 shrink-0" size={16} />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Supported formats */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Supported formats</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><HiDocumentText className="text-blue-500" size={13} /> CSV (.csv)</span>
          <span className="flex items-center gap-1.5"><HiDocumentText className="text-green-500" size={13} /> Excel exported as CSV</span>
          <span className="flex items-center gap-1.5"><HiDocumentText className="text-amber-500" size={13} /> Google Sheets CSV export</span>
          <span className="flex items-center gap-1.5"><HiDocumentText className="text-gray-400" size={13} /> Plain text (.txt)</span>
        </div>
      </div>

      {/* Sample download */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div>
          <p className="text-sm font-medium text-blue-800">Need a template?</p>
          <p className="text-xs text-blue-500 mt-0.5">Download our sample CSV to see the expected format</p>
        </div>
        <button
          onClick={downloadSample}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shrink-0"
        >
          <HiDownload size={14} />
          Sample CSV
        </button>
      </div>
    </div>
  );
}

// ─── Map step ─────────────────────────────────────────────────────────────────
function MapStep({ headers, mapping, setMapping, rows }) {
  const preview = rows[0] || {};

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
        <HiExclamationCircle className="text-amber-500 shrink-0 mt-0.5" size={15} />
        <p className="text-xs text-amber-700">
          Map your spreadsheet columns to Tracksy fields. Required fields are marked with <span className="text-red-500">*</span>.
          We've auto-detected some mappings — review and adjust as needed.
        </p>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {ALL_FIELDS.map(({ key, label, required }) => (
          <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-32 shrink-0">
              <p className="text-xs font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </p>
            </div>
            <HiChevronRight className="text-gray-300 shrink-0" size={14} />
            <select
              value={mapping[key] || ''}
              onChange={e => setMapping(prev => ({ ...prev, [key]: e.target.value || undefined }))}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Not mapped —</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {/* Preview value */}
            {mapping[key] && (
              <span className="text-xs text-gray-400 truncate max-w-[100px]" title={preview[mapping[key]]}>
                e.g. "{String(preview[mapping[key]] || '').slice(0, 20)}"
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Detected {rows.length} row{rows.length !== 1 ? 's' : ''} from your file.
      </p>
    </div>
  );
}

// ─── Preview step ─────────────────────────────────────────────────────────────
function PreviewStep({ renewals, selected, setSelected }) {
  const allSelected = selected.size === renewals.length;

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(renewals.map(r => r.id)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{selected.size}</span> of {renewals.length} rows selected for import
        </p>
        <button onClick={toggleAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-72 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-3 py-2.5 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Renewal Date</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {renewals.map(r => {
              const errs = validateImportRow(r);
              const hasError = errs.length > 0;
              return (
                <tr key={r.id} className={`${hasError ? 'bg-red-50/40' : ''} ${selected.has(r.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      disabled={hasError}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{r.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.vendor}</td>
                  <td className="px-3 py-2.5 text-gray-700">${r.amount.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.renewalDate}</td>
                  <td className="px-3 py-2.5">
                    {hasError ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <HiExclamationCircle size={13} />
                        {errs[0]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <HiCheckCircle size={13} />
                        Ready
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renewals.some(r => validateImportRow(r).length > 0) && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <HiExclamationCircle size={13} />
          Rows with errors are excluded from import. Fix your file and re-upload to include them.
        </p>
      )}
    </div>
  );
}

// ─── Done step ────────────────────────────────────────────────────────────────
function DoneStep({ count, onClose, onGoToRenewals }) {
  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
        <HiCheckCircle className="text-emerald-500" size={36} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">Import Successful!</h3>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold text-emerald-600">{count} renewal{count !== 1 ? 's' : ''}</span> have been added to your dashboard.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={onGoToRenewals} icon={<HiTable size={15} />}>
          View All Renewals
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ImportModal({ isOpen, onClose }) {
  const { refreshRenewals, setCurrentPage } = useRenewal();
  const [step, setStep] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [parsedRenewals, setParsedRenewals] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setParsedRenewals([]);
    setSelected(new Set());
    setImportedCount(0);
    setImportError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleParsed = (result, name) => {
    setFileName(name);
    setHeaders(result.headers);
    setRawRows(result.rows);
    const detected = autoDetectMapping(result.headers);
    setMapping(detected);
    setStep('map');
  };

  const handleMapNext = () => {
    const renewals = rawRows.map(row => rowToRenewal(row, mapping));
    const valid = renewals.filter(r => validateImportRow(r).length === 0);
    setParsedRenewals(renewals);
    setSelected(new Set(valid.map(r => r.id)));
    setStep('preview');
  };

  const handleImport = async () => {
    setImportError(null);
    const toImport = parsedRenewals.filter(r => selected.has(r.id));
    const payload = toImport.map(r => {
      const { _dateValid, _amountValid, id, ...clean } = r;
      return toSnake(clean);
    });
    setImporting(true);
    try {
      await api.post('/api/renewals/import', { renewals: payload });
      await refreshRenewals();
      setImportedCount(toImport.length);
      setStep('done');
    } catch (err) {
      if (err.errors) {
        setImportError('Some rows failed validation. Please check your data and try again.');
      } else {
        setImportError(err.message ?? 'Import failed. Please try again.');
      }
    } finally {
      setImporting(false);
    }
  };

  const canProceedMap = REQUIRED_FIELDS.every(f => mapping[f]);

  const titles = {
    upload: 'Import from Excel / CSV',
    map: 'Map Your Columns',
    preview: 'Preview & Select Rows',
    done: 'Import Complete',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[step]} size="lg">
      <StepBar step={step} />

      {step === 'upload' && <UploadStep onParsed={handleParsed} />}

      {step === 'map' && (
        <>
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-lg">
            <HiDocumentText className="text-blue-500 shrink-0" size={15} />
            <span className="text-xs text-gray-600 truncate">{fileName}</span>
            <span className="ml-auto text-xs text-gray-400">{rawRows.length} rows</span>
          </div>
          <MapStep headers={headers} mapping={mapping} setMapping={setMapping} rows={rawRows} />
          <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStep('upload')} icon={<HiRefresh size={14} />}>
              Re-upload
            </Button>
            <Button
              variant="primary"
              onClick={handleMapNext}
              disabled={!canProceedMap}
              icon={<HiChevronRight size={15} />}
            >
              Preview Data
            </Button>
          </div>
          {!canProceedMap && (
            <p className="text-xs text-red-500 text-right mt-1">
              Please map all required fields (Name, Amount, Renewal Date)
            </p>
          )}
        </>
      )}

      {step === 'preview' && (
        <>
          <PreviewStep renewals={parsedRenewals} selected={selected} setSelected={setSelected} />
          {importError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg mt-3">
              <HiExclamationCircle className="text-red-500 shrink-0" size={16} />
              <p className="text-sm text-red-600">{importError}</p>
            </div>
          )}
          <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStep('map')}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={selected.size === 0 || importing}
              icon={<HiDownload size={15} />}
            >
              {importing ? 'Importing...' : `Import ${selected.size} Renewal${selected.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}

      {step === 'done' && (
        <DoneStep
          count={importedCount}
          onClose={handleClose}
          onGoToRenewals={() => { handleClose(); setCurrentPage('renewals'); }}
        />
      )}
    </Modal>
  );
}
