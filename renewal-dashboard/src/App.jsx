import { useState } from 'react';
import { useRenewal } from './context/RenewalContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import ToastContainer from './components/ui/Toast';
import Dashboard from './pages/Dashboard';
import Renewals from './pages/Renewals';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import VendorProfile from './pages/VendorProfile';
import Notifications from './pages/Notifications';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import RenewalDetail from './pages/RenewalDetail';
import AuthGate from './pages/AuthGate';

function PageContent() {
  const { currentPage, selectedVendorId } = useRenewal();

  if (currentPage === 'vendor-profile' && selectedVendorId) {
    return <VendorProfile />;
  }

  switch (currentPage) {
    case 'dashboard':      return <Dashboard />;
    case 'renewals':       return <Renewals />;
    case 'calendar':       return <Calendar />;
    case 'notifications':  return <Notifications />;
    case 'documents':      return <Documents />;
    case 'reports':        return <Reports />;
    case 'settings':       return <Settings />;
    case 'renewal-detail': return <RenewalDetail />;
    default:               return <Dashboard />;
  }
}

function AppShell() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f1117] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col pb-16 md:pb-0">
          <PageContent />
        </main>
      </div>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}
