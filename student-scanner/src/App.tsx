import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Navbar, type NavTab } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Timetable } from './components/Timetable';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import StudentScanner from './StudentScanner';
import { Profile } from './components/Profile';

function MainPortal() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [calculatorSubject, setCalculatorSubject] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-hot-pink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-ink uppercase tracking-wider font-sora">
            Loading Student Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleNavigate = (tab: NavTab, subject?: string) => {
    if (subject) {
      setCalculatorSubject(subject);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} />
        )}

        {activeTab === 'timetable' && (
          <Timetable onNavigate={setActiveTab} />
        )}

        {activeTab === 'calculator' && (
          <AttendanceCalculator initialSubject={calculatorSubject} />
        )}

        {activeTab === 'scanner' && (
          <StudentScanner onViewDashboard={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* Global Footer */}
      <footer className="hidden md:block py-6 border-t border-hot-pink/15 text-center text-xs text-muted bg-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Symbiosis Institute of Technology • Student Attendance & Academic Portal</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-ink cursor-pointer" onClick={() => setActiveTab('dashboard')}>Dashboard</span>
            <span>•</span>
            <span className="hover:text-ink cursor-pointer" onClick={() => setActiveTab('timetable')}>Timetable</span>
            <span>•</span>
            <span className="hover:text-ink cursor-pointer" onClick={() => setActiveTab('calculator')}>Attendance Calculator</span>
            <span>•</span>
            <span className="hover:text-ink cursor-pointer" onClick={() => setActiveTab('scanner')}>QR Scanner</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainPortal />
    </AuthProvider>
  );
}
