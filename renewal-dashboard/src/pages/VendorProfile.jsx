import { useState, useEffect } from 'react';
import { format, parseISO, addMonths, addYears } from 'date-fns';
import { format as formatDate } from 'date-fns';
import { getVendorEntries, createVendorEntry, updateVendorEntry, deleteVendorEntry } from '../api.js';
import {
  HiArrowLeft, HiRefresh, HiCurrencyDollar, HiCalendar, HiBell,
  HiTag, HiDocumentText, HiPencil, HiTrash, HiGlobe, HiPhone,
  HiMail, HiLocationMarker, HiUsers, HiSparkles, HiCheckCircle,
  HiOfficeBuilding, HiClock, HiChartBar, HiDownload,
} from 'react-icons/hi';
import { useRenewal } from '../context/RenewalContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import RenewalForm from '../components/renewals/RenewalForm';
import DeleteConfirm from '../components/renewals/DeleteConfirm';
import { getStatusFull, getDaysUntilUpcoming, formatCurrency, getUpcomingRenewalDate } from '../utils/renewalUtils';
import { downloadReport } from '../utils/reportGenerator';

// ─── Vendor static data ───────────────────────────────────────────────────────
const VENDOR_DB = {
  Netflix: {
    fullName: 'Netflix, Inc.',
    website: 'https://www.netflix.com',
    email: 'support@netflix.com',
    phone: '+1-888-638-3549',
    headquarters: 'Los Gatos, California, USA',
    founded: '1997',
    employees: '12,800+',
    industry: 'Entertainment / Streaming',
    description:
      'Netflix is the world\'s leading streaming entertainment service with over 230 million paid memberships in 190+ countries. It offers TV series, documentaries, feature films and mobile games across a wide variety of genres and languages.',
    features: ['4K Ultra HD Streaming', 'Multiple Profiles', 'Offline Downloads', 'Ad-Free Viewing', 'Original Content', 'Multi-Device Support'],
    supportLevel: 'Premium',
    uptime: '99.9%',
    contractType: 'Month-to-Month',
    color: 'red',
  },
  AWS: {
    fullName: 'Amazon Web Services, Inc.',
    website: 'https://aws.amazon.com',
    email: 'aws-support@amazon.com',
    phone: '+1-206-266-7010',
    headquarters: 'Seattle, Washington, USA',
    founded: '2006',
    employees: '50,000+',
    industry: 'Cloud Computing / Infrastructure',
    description:
      'Amazon Web Services is the world\'s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. Millions of customers use AWS to lower costs, become more agile, and innovate faster.',
    features: ['EC2 Compute', 'S3 Storage', 'RDS Database', 'Lambda Serverless', 'CloudFront CDN', 'IAM Security', 'VPC Networking', 'Auto Scaling'],
    supportLevel: 'Enterprise',
    uptime: '99.99%',
    contractType: 'Pay-as-you-go',
    color: 'amber',
  },
  Figma: {
    fullName: 'Figma, Inc.',
    website: 'https://www.figma.com',
    email: 'support@figma.com',
    phone: '+1-415-800-3500',
    headquarters: 'San Francisco, California, USA',
    founded: '2012',
    employees: '800+',
    industry: 'Design / Collaboration',
    description:
      'Figma is a collaborative interface design tool that runs in the browser. It enables teams to design, prototype, and gather feedback all in one place, making the design process faster and more collaborative.',
    features: ['Real-time Collaboration', 'Design Systems', 'Interactive Prototyping', 'Developer Handoff', 'Component Libraries', 'Version History'],
    supportLevel: 'Standard',
    uptime: '99.5%',
    contractType: 'Annual Subscription',
    color: 'purple',
  },
  Slack: {
    fullName: 'Slack Technologies, LLC (Salesforce)',
    website: 'https://slack.com',
    email: 'feedback@slack.com',
    phone: '+1-415-514-4000',
    headquarters: 'San Francisco, California, USA',
    founded: '2013',
    employees: '2,500+',
    industry: 'Communication / Collaboration',
    description:
      'Slack is a messaging platform that brings team communication and collaboration into one place. It integrates with hundreds of tools and services, making it the central hub for modern workplace communication.',
    features: ['Channels & DMs', 'File Sharing', '2,400+ Integrations', 'Workflow Automation', 'Video Huddles', 'Search & Archive'],
    supportLevel: 'Premium',
    uptime: '99.9%',
    contractType: 'Monthly Subscription',
    color: 'green',
  },
  GitHub: {
    fullName: 'GitHub, Inc. (Microsoft)',
    website: 'https://github.com',
    email: 'support@github.com',
    phone: '+1-415-735-4488',
    headquarters: 'San Francisco, California, USA',
    founded: '2008',
    employees: '3,000+',
    industry: 'Software Development / DevOps',
    description:
      'GitHub is the world\'s leading software development platform. It provides hosting for software development and version control using Git, plus features for collaboration, code review, project management, and CI/CD pipelines.',
    features: ['Git Repositories', 'Pull Requests', 'GitHub Actions CI/CD', 'Code Review', 'Project Boards', 'Security Scanning', 'Packages Registry'],
    supportLevel: 'Enterprise',
    uptime: '99.95%',
    contractType: 'Annual Subscription',
    color: 'blue',
  },
  Notion: {
    fullName: 'Notion Labs, Inc.',
    website: 'https://www.notion.so',
    email: 'team@makenotion.com',
    phone: '+1-415-800-3500',
    headquarters: 'San Francisco, California, USA',
    founded: '2016',
    employees: '400+',
    industry: 'Productivity / Knowledge Management',
    description:
      'Notion is an all-in-one workspace that combines notes, databases, wikis, and project management. Teams use it to write, plan, collaborate, and organize everything in one place.',
    features: ['Databases & Tables', 'Wiki & Docs', 'Kanban Boards', 'Calendar Views', 'API Access', 'Templates Gallery', 'Team Collaboration'],
    supportLevel: 'Standard',
    uptime: '99.8%',
    contractType: 'Annual Subscription',
    color: 'gray',
  },
  Zoom: {
    fullName: 'Zoom Video Communications, Inc.',
    website: 'https://zoom.us',
    email: 'support@zoom.us',
    phone: '+1-888-799-9666',
    headquarters: 'San Jose, California, USA',
    founded: '2011',
    employees: '7,400+',
    industry: 'Video Conferencing / Communication',
    description:
      'Zoom is a leader in modern enterprise video communications, with an easy, reliable cloud platform for video and audio conferencing, chat, and webinars across mobile, desktop, and room systems.',
    features: ['HD Video Meetings', 'Screen Sharing', 'Cloud Recording', 'Breakout Rooms', 'Virtual Backgrounds', 'Webinar Hosting', 'Zoom Phone'],
    supportLevel: 'Premium',
    uptime: '99.99%',
    contractType: 'Annual Subscription',
    color: 'blue',
  },
  Jira: {
    fullName: 'Atlassian Corporation Plc',
    website: 'https://www.atlassian.com/software/jira',
    email: 'support@atlassian.com',
    phone: '+1-415-701-1110',
    headquarters: 'Sydney, New South Wales, Australia',
    founded: '2002',
    employees: '10,000+',
    industry: 'Project Management / DevOps',
    description:
      'Jira is the #1 software development tool used by agile teams. It helps teams plan, track, release, and report on their work with powerful issue tracking, agile boards, and reporting capabilities.',
    features: ['Scrum & Kanban Boards', 'Issue Tracking', 'Sprint Planning', 'Roadmaps', 'Automation Rules', 'Advanced Reporting', '3,000+ Integrations'],
    supportLevel: 'Enterprise',
    uptime: '99.9%',
    contractType: 'Monthly Subscription',
    color: 'blue',
  },
  Spotify: {
    fullName: 'Spotify AB',
    website: 'https://www.spotify.com',
    email: 'support@spotify.com',
    phone: '+46-8-508-308-00',
    headquarters: 'Stockholm, Sweden',
    founded: '2006',
    employees: '9,800+',
    industry: 'Music / Podcast Streaming',
    description:
      'Spotify is the world\'s most popular audio streaming subscription service with 600+ million users, including 240+ million subscribers. It offers music, podcasts, and audiobooks from creators all over the world.',
    features: ['100M+ Songs', 'Offline Downloads', 'Personalized Playlists', 'Podcast Library', 'Audiobooks', 'Cross-Device Sync', 'High Quality Audio'],
    supportLevel: 'Standard',
    uptime: '99.8%',
    contractType: 'Monthly Subscription',
    color: 'green',
  },
  Linear: {
    fullName: 'Linear Orbit, Inc.',
    website: 'https://linear.app',
    email: 'support@linear.app',
    phone: '+1-415-800-3500',
    headquarters: 'San Francisco, California, USA',
    founded: '2019',
    employees: '80+',
    industry: 'Project Management / Engineering',
    description:
      'Linear is the issue tracking tool that engineers actually enjoy using. Built for speed and designed for modern software teams, it streamlines the entire product development process with a focus on simplicity and performance.',
    features: ['Lightning-Fast UI', 'Keyboard-First Design', 'Git Integration', 'Cycle Planning', 'Roadmaps', 'Slack & GitHub Sync', 'API & Webhooks'],
    supportLevel: 'Premium',
    uptime: '99.9%',
    contractType: 'Annual Subscription',
    color: 'indigo',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, valueClass = '', iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={iconColor} size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-gray-800 break-words ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    red:     'bg-red-50 text-red-700 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${colors[color] || colors.blue}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ─── Timeline Component ───────────────────────────────────────────────────────
function RenewalTimeline({ renewal, upcomingDate, days }) {
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Purchase date (if exists)
  if (renewal.purchaseDate) {
    events.push({
      type: 'purchase',
      date: parseISO(renewal.purchaseDate),
      label: 'Purchase Date',
      icon: HiCalendar,
      color: 'gray',
    });
  }

  // 2. All past renewals between purchase date and upcoming renewal date
  if (renewal.purchaseDate) {
    const purchaseDate = parseISO(renewal.purchaseDate);
    let iterDate = renewal.billingCycle === 'yearly' ? addYears(purchaseDate, 1) : addMonths(purchaseDate, 1);
    let count = 1;

    while (iterDate < upcomingDate && count < 50) {
      events.push({
        type: 'past-renewal',
        date: iterDate,
        label: `Renewal #${count}`,
        icon: HiCheckCircle,
        color: 'emerald',
      });
      iterDate = renewal.billingCycle === 'yearly' ? addYears(iterDate, 1) : addMonths(iterDate, 1);
      count++;
    }
  }

  // 3. Upcoming renewal date (the next one from today)
  events.push({
    type: 'upcoming',
    date: upcomingDate,
    label: 'Upcoming Renewal',
    icon: HiRefresh,
    color: days === 0 ? 'blue' : days <= 7 ? 'amber' : 'blue',
    highlight: true,
    badge: days === 0 ? 'Due today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`,
  });

  // 4. Renewal alert date (upcoming renewal minus reminder days)
  const reminderDate = new Date(upcomingDate.getTime() - renewal.reminderDays * 86400000);
  events.push({
    type: 'reminder',
    date: reminderDate,
    label: 'Renewal Alert',
    icon: HiBell,
    color: 'amber',
    sub: `${renewal.reminderDays}d before renewal`,
  });

  // Sort events by date ascending
  events.sort((a, b) => a.date - b.date);

  const colorMap = {
    gray:    { bg: 'bg-gray-100',    icon: 'text-gray-400',    text: 'text-gray-700',    badge: 'bg-gray-50 text-gray-600' },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-600' },
    blue:    { bg: 'bg-blue-100',    icon: 'text-blue-500',    text: 'text-blue-700',    badge: 'bg-blue-50 text-blue-600' },
    amber:   { bg: 'bg-amber-100',   icon: 'text-amber-500',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-600' },
    red:     { bg: 'bg-red-100',     icon: 'text-red-500',     text: 'text-red-700',     badge: 'bg-red-50 text-red-600' },
  };

  return (
    <div className="space-y-0">
      {events.map((evt, idx) => {
        const c = colorMap[evt.color] || colorMap.gray;
        const Icon = evt.icon;
        const isLast = idx === events.length - 1;
        const isPast = evt.date < today && evt.type !== 'upcoming';

        return (
          <div key={idx} className="flex gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.bg} ${evt.highlight ? 'ring-2 ring-blue-200' : ''}`}>
                <Icon className={c.icon} size={15} />
              </div>
              {!isLast && <div className={`w-0.5 flex-1 my-1.5 ${isPast ? 'bg-emerald-200' : 'bg-gray-100'}`} />}
            </div>

            {/* Content column */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{evt.label}</p>
                {isPast && evt.type === 'past-renewal' && (
                  <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">Completed</span>
                )}
              </div>
              <p className={`text-sm font-semibold mt-0.5 ${evt.highlight ? 'text-blue-600' : c.text}`}>
                {format(evt.date, 'MMMM d, yyyy')}
              </p>
              {evt.badge && (
                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.badge}`}>
                  {evt.badge}
                </span>
              )}
              {evt.sub && (
                <p className="text-xs text-gray-400 mt-1">{evt.sub}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VendorProfile() {
  const { renewals, selectedVendorId, setCurrentPage, deleteRenewal } = useRenewal();
  const [editRenewal, setEditRenewal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [vendorEntries, setVendorEntries] = useState([]);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const [vendorError, setVendorError] = useState(null);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editFields, setEditFields] = useState([]);
  const [editName, setEditName] = useState('');
  const [migrationData, setMigrationData] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryFields, setNewEntryFields] = useState([]);

  // Read from context
  const renewal = renewals.find(r => r.id === selectedVendorId);

  const fetchVendorEntries = async (renewalId) => {
    if (!renewalId) return;
    setLoadingVendor(true);
    setVendorError(null);
    try {
      const res = await getVendorEntries(renewalId);
      setVendorEntries(res.data.data ?? res.data);
    } catch (err) {
      console.error('Vendor entries fetch error:', err);
      setVendorError('Failed to load vendor information.');
    } finally {
      setLoadingVendor(false);
    }
  };

  useEffect(() => {
    if (!renewal?.id) return;
    fetchVendorEntries(renewal.id);
    const saved = localStorage.getItem(`vendor_info_${renewal.name}`);
    if (saved) {
      try { setMigrationData(JSON.parse(saved)); } catch {}
    }
  }, [renewal?.id]);

  if (!renewal) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <HiOfficeBuilding className="text-gray-400" size={28} />
        </div>
        <p className="text-base font-semibold text-gray-600 mb-1">No vendor selected</p>
        <p className="text-sm text-gray-400 mb-6">Click any vendor name from the dashboard to view their profile.</p>
        <Button variant="primary" onClick={() => setCurrentPage('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const status = getStatusFull(renewal);
  const days = getDaysUntilUpcoming(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);
  const upcomingDate = getUpcomingRenewalDate(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);
  const monthlyAmount = renewal.billingCycle === 'monthly' ? renewal.amount : renewal.amount / 12;
  const yearlyAmount  = renewal.billingCycle === 'yearly'  ? renewal.amount : renewal.amount * 12;

  const daysLabel =
    days < 0  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
    : days === 0 ? 'Due today'
    : `${days} day${days !== 1 ? 's' : ''} remaining`;

  const urgencyColor =
    days < 0  ? 'bg-red-50 text-red-700 border-red-100'
    : days === 0 ? 'bg-blue-50 text-blue-700 border-blue-100'
    : days <= 7  ? 'bg-amber-50 text-amber-700 border-amber-100'
    : 'bg-emerald-50 text-emerald-700 border-emerald-100';

  const info = VENDOR_DB[renewal.name] || {
    fullName: renewal.vendor,
    website: '#',
    email: 'N/A',
    phone: 'N/A',
    headquarters: 'N/A',
    founded: 'N/A',
    employees: 'N/A',
    industry: renewal.category || 'N/A',
    description: `${renewal.name} is a software service tracked in Tracksy.`,
    features: [],
    supportLevel: 'Standard',
    uptime: '99.0%',
    contractType: renewal.billingCycle === 'monthly' ? 'Monthly Subscription' : 'Annual Subscription',
    color: 'blue',
  };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Top nav bar ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <HiArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
            <span className="text-white font-bold text-lg">{renewal.name[0]}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{renewal.name}</h1>
            <p className="text-sm text-gray-500 truncate">{info.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge status={status} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { downloadReport(renewal, info, vendorEntries.length > 0 ? vendorEntries[vendorEntries.length - 1].fields : [], vendorEntries); }}
            icon={<HiDownload size={14} />}
          >
            Download Report
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditRenewal(renewal)} icon={<HiPencil size={14} />}>
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteTarget(renewal)}
            icon={<HiTrash size={14} />}
            className="!text-red-600"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* ── Urgency banner ── */}
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium w-fit ${urgencyColor}`}>
        <HiClock size={16} />
        {daysLabel}
      </div>

      {/* ── 4 stat pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Monthly (USD)"  value={`$${(monthlyAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="blue" />
        <StatPill label="Annual (USD)"   value={`$${(yearlyAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}  color="emerald" />
        <StatPill label="Days Remaining" value={days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`} color={days < 0 ? 'red' : days <= 7 ? 'amber' : 'blue'} />
        <StatPill label="Billing Cycle"  value={renewal.billingCycle.charAt(0).toUpperCase() + renewal.billingCycle.slice(1)} color="emerald" />
      </div>

      {/* INR amounts if present */}
      {renewal.amountInr != null && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
            <span className="text-lg font-bold text-orange-600">₹</span>
            <div>
              <p className="text-xs text-orange-500 font-medium">Monthly (INR)</p>
              <p className="text-sm font-bold text-orange-700">
                ₹{(renewal.billingCycle === 'monthly' ? renewal.amountInr : renewal.amountInr / 12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
            <span className="text-lg font-bold text-orange-600">₹</span>
            <div>
              <p className="text-xs text-orange-500 font-medium">Annual (INR)</p>
              <p className="text-sm font-bold text-orange-700">
                ₹{(renewal.billingCycle === 'yearly' ? renewal.amountInr : renewal.amountInr * 12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main 3-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT (2 cols) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* About */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HiOfficeBuilding className="text-blue-600" size={16} />
              About {renewal.name}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
          </Card>

          {/* Subscription details */}
          <Card className="overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiCurrencyDollar className="text-blue-600" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Subscription Details</h2>
                <p className="text-xs text-gray-400">Billing & pricing breakdown</p>
              </div>
            </div>

            {/* Cost highlight strip */}
            <div className={`grid divide-x divide-gray-100 border-b border-gray-100 ${renewal.amountInr != null ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {[
                { label: 'Billed (USD)',  value: `$${Number(renewal.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,   sub: renewal.billingCycle },
                { label: 'Monthly (USD)', value: `$${monthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,    sub: 'per month' },
                { label: 'Annual (USD)',  value: `$${yearlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,     sub: 'per year' },
                ...(renewal.amountInr != null ? [{ label: 'Billed (INR)', value: `₹${Number(renewal.amountInr).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: renewal.billingCycle, inr: true }] : []),
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center justify-center py-4 px-3 text-center ${i === 0 ? 'bg-blue-50' : item.inr ? 'bg-orange-50' : ''}`}>
                  <p className={`text-lg font-bold ${i === 0 ? 'text-blue-700' : item.inr ? 'text-orange-600' : 'text-gray-800'}`}>{item.value}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{item.label}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Detail rows */}
            <div className="px-6 py-2">
              {[
                { icon: HiTag,      label: 'Billing Cycle',  value: renewal.billingCycle.charAt(0).toUpperCase() + renewal.billingCycle.slice(1) },
                { icon: HiTag,      label: 'Contract Type',  value: info.contractType },
                { icon: HiTag,      label: 'Category',       value: renewal.category || '—' },
                ...(renewal.purchaseDate ? [{ icon: HiCalendar, label: 'Purchase Date', value: format(parseISO(renewal.purchaseDate), 'MMM d, yyyy') }] : []),
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <row.icon className="text-gray-400 shrink-0" size={14} />
                    <span className="text-sm text-gray-500">{row.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Renewal schedule */}
          <Card className="overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <HiCalendar className="text-emerald-600" size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Renewal Schedule</h2>
                  <p className="text-xs text-gray-400">Full lifecycle timeline</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 capitalize">
                {renewal.billingCycle}
              </span>
            </div>

            {/* Timeline */}
            <div className="px-6 py-5">
              <RenewalTimeline renewal={renewal} upcomingDate={upcomingDate} days={days} />
            </div>
          </Card>

          {/* Key features */}
          {info.features.length > 0 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiSparkles className="text-blue-600" size={16} />
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {info.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                    <HiCheckCircle className="text-emerald-500 shrink-0" size={16} />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {renewal.notes && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="text-blue-600" size={16} />
                Notes
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{renewal.notes}</p>
            </Card>
          )}
        </div>

        {/* ── RIGHT (1 col) ── */}
        <div className="space-y-5">

          {/* Migration banner */}
          {migrationData && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-800 mb-1">Migrate existing vendor info?</p>
              <p className="text-xs text-amber-600 mb-2">You have vendor info saved locally. Save it to the database?</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await createVendorEntry(renewal.id, {
                        name: renewal.vendor,
                        notes: '',
                        fields: migrationData,
                      });
                      setVendorEntries(prev => [...prev, res.data]);
                      localStorage.removeItem(`vendor_info_${renewal.name}`);
                      setMigrationData(null);
                    } catch {
                      alert('Migration failed. Please try again.');
                    }
                  }}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"
                >
                  Migrate
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(`vendor_info_${renewal.name}`);
                    setMigrationData(null);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Vendor Information Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <HiUsers className="text-emerald-600" size={16} />
                Vendor Information
              </h2>
              <button
                onClick={() => setAddingNew(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Entry
              </button>
            </div>

            {/* Loading state */}
            {loadingVendor && (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            )}

            {/* Error state */}
            {vendorError && !loadingVendor && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-600">{vendorError}</p>
                <button onClick={() => fetchVendorEntries(renewal.id)} className="text-xs text-red-600 underline">Retry</button>
              </div>
            )}

            {/* Empty state */}
            {!loadingVendor && !vendorError && vendorEntries.length === 0 && (
              <p className="text-xs text-gray-400 py-2">No vendor information yet. Click "+ Add Entry" to add details.</p>
            )}

            {/* Most recent entry — primary display */}
            {!loadingVendor && !vendorError && vendorEntries.length > 0 && (() => {
              const latest = vendorEntries[vendorEntries.length - 1];
              const isEditing = editingEntryId === latest.id;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">{latest.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEntryId(latest.id);
                          setEditName(latest.name);
                          setEditFields(latest.fields?.length > 0 ? latest.fields.map(f => ({ label: f.label, value: f.value || '' })) : [{ label: '', value: '' }]);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const snapshot = [...vendorEntries];
                          setVendorEntries(prev => prev.filter(e => e.id !== latest.id));
                          try {
                            await deleteVendorEntry(renewal.id, latest.id);
                          } catch {
                            setVendorEntries(snapshot);
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Vendor name"
                      />
                      {editFields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            className="w-28 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
                            value={field.label}
                            onChange={e => {
                              const u = [...editFields]; u[idx] = { ...u[idx], label: e.target.value }; setEditFields(u);
                            }}
                            placeholder="Label"
                          />
                          <input
                            className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={field.value}
                            onChange={e => {
                              const u = [...editFields]; u[idx] = { ...u[idx], value: e.target.value }; setEditFields(u);
                            }}
                            placeholder="Value"
                          />
                          <button onClick={() => setEditFields(editFields.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1">
                            <HiTrash size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setEditFields(prev => [...prev, { label: '', value: '' }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          + Add field
                        </button>
                        <button
                          onClick={async () => {
                            const snapshot = [...vendorEntries];
                            const updated = vendorEntries.map(e => e.id === latest.id ? { ...e, name: editName, fields: editFields } : e);
                            setVendorEntries(updated);
                            setEditingEntryId(null);
                            try {
                              const res = await updateVendorEntry(renewal.id, latest.id, { name: editName, fields: editFields });
                              setVendorEntries(prev => prev.map(e => e.id === latest.id ? res.data : e));
                            } catch {
                              setVendorEntries(snapshot);
                            }
                          }}
                          className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingEntryId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {(latest.fields || []).filter(f => f.label || f.value).map((field, idx) => (
                        <div key={idx} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                          <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <HiUsers className="text-emerald-600" size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                            <p className="text-sm font-medium text-gray-800 break-words">{field.value || '—'}</p>
                          </div>
                        </div>
                      ))}
                      {(!latest.fields || latest.fields.length === 0) && (
                        <p className="text-xs text-gray-400 py-1">No fields. Click Edit to add details.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>

          {/* Add new entry form */}
          {addingNew && (
            <Card className="p-5 border-blue-200 border">
              <p className="text-sm font-semibold text-gray-800 mb-4">New Vendor Entry</p>

              {/* Vendor name */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vendor Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEntryName}
                  onChange={e => setNewEntryName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              {/* Standard fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {[
                  { label: 'Phone', placeholder: '+1-800-000-0000', type: 'tel' },
                  { label: 'Email', placeholder: 'support@vendor.com', type: 'email' },
                  { label: 'Website', placeholder: 'https://vendor.com', type: 'url' },
                  { label: 'Headquarters', placeholder: 'City, Country', type: 'text' },
                ].map(({ label, placeholder, type }) => {
                  const field = newEntryFields.find(f => f.label === label);
                  return (
                    <div key={label}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                      <input
                        type={type}
                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field?.value || ''}
                        onChange={e => {
                          setNewEntryFields(prev => {
                            const exists = prev.find(f => f.label === label);
                            if (exists) return prev.map(f => f.label === label ? { ...f, value: e.target.value } : f);
                            return [...prev, { label, value: e.target.value }];
                          });
                        }}
                        placeholder={placeholder}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                <textarea
                  rows={2}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={newEntryFields.find(f => f.label === 'Notes')?.value || ''}
                  onChange={e => {
                    setNewEntryFields(prev => {
                      const exists = prev.find(f => f.label === 'Notes');
                      if (exists) return prev.map(f => f.label === 'Notes' ? { ...f, value: e.target.value } : f);
                      return [...prev, { label: 'Notes', value: e.target.value }];
                    });
                  }}
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Custom extra fields */}
              {newEntryFields.filter(f => !['Phone','Email','Website','Headquarters','Notes'].includes(f.label)).map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    className="w-28 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                    value={field.label}
                    onChange={e => {
                      const customFields = newEntryFields.filter(f => !['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      const allOthers = newEntryFields.filter(f => ['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      customFields[idx] = { ...customFields[idx], label: e.target.value };
                      setNewEntryFields([...allOthers, ...customFields]);
                    }}
                    placeholder="Field name"
                  />
                  <input
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={field.value}
                    onChange={e => {
                      const customFields = newEntryFields.filter(f => !['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      const allOthers = newEntryFields.filter(f => ['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      customFields[idx] = { ...customFields[idx], value: e.target.value };
                      setNewEntryFields([...allOthers, ...customFields]);
                    }}
                    placeholder="Value"
                  />
                  <button
                    onClick={() => {
                      const customFields = newEntryFields.filter(f => !['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      const allOthers = newEntryFields.filter(f => ['Phone','Email','Website','Headquarters','Notes'].includes(f.label));
                      setNewEntryFields([...allOthers, ...customFields.filter((_, i) => i !== idx)]);
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <HiTrash size={14} />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setNewEntryFields(prev => [...prev, { label: '', value: '' }])}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  + Add custom field
                </button>
                <button
                  onClick={async () => {
                    if (!newEntryName.trim()) return;
                    const fieldsToSave = newEntryFields.filter(f => f.label && f.value);
                    try {
                      const res = await createVendorEntry(renewal.id, { name: newEntryName, fields: fieldsToSave });
                      setVendorEntries(prev => [...prev, res.data]);
                      setAddingNew(false);
                      setNewEntryName('');
                      setNewEntryFields([]);
                    } catch (err) {
                      console.error('Create vendor entry error:', err?.response?.data || err?.message || err);
                      setVendorError('Failed to create vendor entry. Check console for details.');
                    }
                  }}
                  className="ml-auto text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => { setAddingNew(false); setNewEntryName(''); setNewEntryFields([]); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </Card>
          )}

          {/* Vendor History */}
          {vendorEntries.length > 1 && (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <HiOfficeBuilding className="text-blue-600" size={16} />
                Vendor History
              </h2>
              <div className="space-y-3">
                {vendorEntries.slice(0, -1).reverse().map((entry, idx) => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{entry.name}</p>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] text-gray-400">{format(parseISO(entry.createdAt || entry.created_at), 'MMM d, yyyy')}</span>
                        <button
                          onClick={async () => {
                            const snapshot = [...vendorEntries];
                            setVendorEntries(prev => prev.filter(e => e.id !== entry.id));
                            try {
                              await deleteVendorEntry(renewal.id, entry.id);
                            } catch {
                              setVendorEntries(snapshot);
                            }
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <HiTrash size={12} />
                        </button>
                      </div>
                    </div>
                    {(entry.fields || []).slice(0, 3).map((f, i) => (
                      <p key={i} className="text-xs text-gray-500">{f.label}: <span className="text-gray-700">{f.value || '—'}</span></p>
                    ))}
                    {(entry.fields || []).length > 3 && (
                      <p className="text-xs text-gray-400">+{entry.fields.length - 3} more fields</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Service level */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HiChartBar className="text-blue-600" size={16} />
              Service Level
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Support Level</span>
                <span className="text-sm font-semibold text-blue-600">{info.supportLevel}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-sm text-gray-500">Uptime SLA</span>
                <span className="text-sm font-semibold text-emerald-600">{info.uptime}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-sm text-gray-500">Status</span>
                <Badge status={status} />
              </div>
            </div>
          </Card>

          {/* Quick actions */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="primary" onClick={() => setEditRenewal(renewal)} icon={<HiPencil size={15} />} className="w-full">
                Edit Renewal
              </Button>
              <Button
                variant="secondary"
                onClick={() => downloadReport(renewal, info, vendorEntries.length > 0 ? vendorEntries[vendorEntries.length - 1].fields : [], vendorEntries)}
                icon={<HiDownload size={15} />}
                className="w-full"
              >
                Download Report
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage('dashboard')}
                icon={<HiArrowLeft size={15} />}
                className="w-full"
              >
                Back to Dashboard
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteTarget(renewal)}
                icon={<HiTrash size={15} />}
                className="w-full !text-red-600"
              >
                Delete Renewal
              </Button>
            </div>
          </Card>

        </div>
      </div>

      {/* ── Modals ── */}
      <RenewalForm
        isOpen={!!editRenewal}
        onClose={() => setEditRenewal(null)}
        editRenewal={editRenewal}
      />
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRenewal(deleteTarget?.id);
          setCurrentPage('dashboard');
        }}
        renewalName={deleteTarget?.name}
      />
    </div>
  );
}
