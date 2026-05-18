import { useState } from 'react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ImportModal from '../components/import/ImportModal';
import { useRenewal } from '../context/RenewalContext';
import { useAuth } from '../context/AuthContext';
import {
  HiUser, HiBell, HiDatabase, HiLogout, HiDownload,
  HiUpload, HiTrash, HiShieldCheck, HiSave, HiMail,
  HiOfficeBuilding, HiChevronRight, HiExclamation,
} from 'react-icons/hi';

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

function FieldGroup({ children }) {
  return <div className="space-y-4">{children}</div>;
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

function DataActionCard({ icon: Icon, iconBg, iconColor, title, description, action }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all duration-150">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={iconColor} size={17} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={action.onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${action.className}`}
      >
        {action.label}
        <HiChevronRight size={13} />
      </button>
    </div>
  );
}

function ResetConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset to Defaults" size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <HiExclamation className="text-red-500" size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Are you absolutely sure?</p>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            This will permanently delete all your renewals and restore the sample data. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 !bg-red-600 !text-white !border-red-600 hover:!bg-red-700"
          >
            Yes, Reset
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ProfileTab({ profile, setProfile, onSave, currentUser }) {
  const initials = (profile.name || 'U')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <SectionHeader title="Profile" subtitle="Manage your personal information and account details." />

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-bold text-xl">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{profile.name || 'Your Name'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
          {profile.company && <p className="text-xs text-blue-500 mt-0.5">{profile.company}</p>}
        </div>
      </div>

      <FieldGroup>
        <Input
          label="Full Name"
          name="name"
          value={profile.name}
          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          placeholder="John Doe"
          icon={<HiUser size={15} />}
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={profile.email}
          onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
          placeholder="you@company.com"
        />
        <Input
          label="Company"
          name="company"
          value={profile.company}
          onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
          placeholder="Acme Corp"
        />
      </FieldGroup>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button variant="primary" onClick={onSave} icon={<HiSave size={15} />}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationsTab({ settings, setSettings, onSave }) {
  return (
    <div>
      <SectionHeader title="Notifications" subtitle="Control how and when Tracksy reminds you about renewals." />

      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Default Reminder Days
        </label>
        <p className="text-xs text-gray-400 mb-3">
          How many days before a renewal date should we alert you by default?
        </p>
        <div className="grid grid-cols-4 gap-2">
          {['3', '7', '14', '30'].map(d => (
            <button
              key={d}
              onClick={() => setSettings(p => ({ ...p, defaultReminder: d }))}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                settings.defaultReminder === d
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
              }`}
            >
              {d}d
              {settings.defaultReminder === d && (
                <span className="block text-[10px] font-normal mt-0.5">selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <Toggle
          checked={settings.emailNotifs}
          onChange={() => setSettings(p => ({ ...p, emailNotifs: !p.emailNotifs }))}
          label="Email Notifications"
          description="Receive renewal reminders via email"
        />
        <Toggle
          checked={settings.browserNotifs}
          onChange={() => setSettings(p => ({ ...p, browserNotifs: !p.browserNotifs }))}
          label="Browser Notifications"
          description="Show desktop alerts for upcoming renewals"
        />
        <Toggle
          checked={settings.overdueAlerts}
          onChange={() => setSettings(p => ({ ...p, overdueAlerts: !p.overdueAlerts }))}
          label="Overdue Alerts"
          description="Get notified immediately when a renewal becomes overdue"
        />
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button variant="primary" onClick={onSave} icon={<HiSave size={15} />}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function DataTab({ renewals, onImport, onExport, onExportCSV, onReset }) {
  return (
    <div>
      <SectionHeader title="Data Management" subtitle="Import, export, or reset your renewal data." />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Renewals', value: renewals.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Storage Used', value: `${(JSON.stringify(renewals).length / 1024).toFixed(1)} KB`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Data Source', value: 'Cloud DB', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <DataActionCard
          icon={HiDownload}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Import Data"
          description="Upload a CSV or Excel file to import renewals"
          action={{ label: 'Import', onClick: onImport, className: 'bg-blue-50 text-blue-600 hover:bg-blue-100' }}
        />
        <DataActionCard
          icon={HiUpload}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Export as JSON"
          description="Download all your renewal data as a JSON file"
          action={{ label: 'Export JSON', onClick: onExport, className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' }}
        />
        <DataActionCard
          icon={HiUpload}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          title="Export as CSV"
          description="Download renewals as a spreadsheet-compatible CSV"
          action={{ label: 'Export CSV', onClick: onExportCSV, className: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' }}
        />
        <DataActionCard
          icon={HiTrash}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          title="Reset to Defaults"
          description="Clear all data and restore sample renewals"
          action={{ label: 'Reset', onClick: onReset, className: 'bg-red-50 text-red-500 hover:bg-red-100' }}
        />
      </div>
    </div>
  );
}

function AccountTab({ currentUser, onLogout }) {
  return (
    <div>
      <SectionHeader title="Account" subtitle="Manage your Tracksy account and session." />

      {/* Account card */}
      <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">
              {(currentUser?.name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <HiMail size={11} />
              {currentUser?.email}
            </p>
            {currentUser?.company && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <HiOfficeBuilding size={11} />
                {currentUser.company}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
            <HiShieldCheck className="text-emerald-500" size={13} />
            <span className="text-xs font-medium text-emerald-600">Active</span>
          </div>
        </div>
      </div>

      {/* Session info */}
      <div className="rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Session Details</p>
        </div>
        {[
          { label: 'Account Type', value: 'Free Plan' },
          { label: 'Data Storage', value: 'Browser (localStorage)' },
          { label: 'App Version', value: 'v1.0.0' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-medium text-gray-800">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="p-4 rounded-xl border border-red-100 bg-red-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-700">Sign Out</p>
            <p className="text-xs text-red-400 mt-0.5">You'll need to log in again to access your data.</p>
          </div>
          <Button
            variant="danger"
            onClick={onLogout}
            icon={<HiLogout size={15} />}
            className="!bg-red-600 !text-white !border-red-600 hover:!bg-red-700 shrink-0"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: HiUser,       desc: 'Personal info'     },
  { id: 'notifications', label: 'Notifications', icon: HiBell,       desc: 'Alerts & reminders' },
  { id: 'data',          label: 'Data',          icon: HiDatabase,   desc: 'Import & export'   },
  { id: 'account',       label: 'Account',       icon: HiShieldCheck, desc: 'Session & plan'   },
];

export default function Settings() {
  const { addToast, renewals } = useRenewal();
  const { currentUser, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [showImport, setShowImport] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name:    currentUser?.name    || '',
    email:   currentUser?.email   || '',
    company: currentUser?.company || '',
  });

  const [notifSettings, setNotifSettings] = useState({
    defaultReminder: '7',
    emailNotifs:     true,
    browserNotifs:   false,
    overdueAlerts:   true,
  });

  const handleSave = (section) => {
    if (section === 'Profile') updateProfile({ name: profile.name, company: profile.company });
    addToast(`${section} settings saved`, 'success');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(renewals, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'tracksy-renewals-export.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported as JSON', 'success');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Vendor', 'Amount', 'Billing Cycle', 'Purchase Date', 'Renewal Date', 'Reminder Days', 'Category', 'Notes'];
    const rows = renewals.map(r => [
      r.name, r.vendor, r.amount, r.billingCycle,
      r.purchaseDate || '', r.renewalDate, r.reminderDays,
      r.category || '', r.notes || '',
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'tracksy-renewals-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported as CSV', 'success');
  };

  const handleReset = () => {
    localStorage.removeItem('renewal_dashboard_data');
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account, preferences and data.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">

        {/* ── Sidebar tabs ── */}
        <div className="md:w-60 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
            {TABS.map(tab => {
              const Icon    = tab.icon;
              const active  = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all duration-150 border-b border-gray-50 last:border-0 ${
                    active
                      ? 'bg-blue-50 border-l-[3px] border-l-blue-600'
                      : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={active ? 'text-blue-600' : 'text-gray-400'} size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                      {tab.label}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{tab.desc}</p>
                  </div>
                  {active && <HiChevronRight className="text-blue-400 shrink-0" size={14} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Content panel ── */}
        <div className="flex-1 min-w-0 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-full overflow-y-auto">
            {activeTab === 'profile' && (
              <ProfileTab
                profile={profile}
                setProfile={setProfile}
                onSave={() => handleSave('Profile')}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab
                settings={notifSettings}
                setSettings={setNotifSettings}
                onSave={() => handleSave('Notification')}
              />
            )}
            {activeTab === 'data' && (
              <DataTab
                renewals={renewals}
                onImport={() => setShowImport(true)}
                onExport={handleExport}
                onExportCSV={handleExportCSV}
                onReset={() => setShowResetConfirm(true)}
              />
            )}
            {activeTab === 'account' && (
              <AccountTab
                currentUser={currentUser}
                onLogout={logout}
              />
            )}
          </div>
        </div>
      </div>

      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
