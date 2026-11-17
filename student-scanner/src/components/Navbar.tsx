import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarDays, 
  Calculator, 
  QrCode, 
  LogOut, 
  RefreshCw,
  ChevronDown,
  UserRound
} from 'lucide-react';

export type NavTab = 'dashboard' | 'timetable' | 'calculator' | 'scanner' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { student, logout, isBackendConnected, recheckConnection } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleRecheck = async () => {
    setIsChecking(true);
    await recheckConnection();
    setTimeout(() => setIsChecking(false), 500);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'timetable', label: 'Timetable', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'calculator', label: 'Attendance Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'scanner', label: 'QR Scanner', icon: <QrCode className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <UserRound className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Desktop / Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-hot-pink/15 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onTabChange('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hot-pink to-thistle flex items-center justify-center text-white shadow-md shadow-hot-pink/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sora font-extrabold text-ink text-base sm:text-lg tracking-tight block leading-tight">
                  Student Portal
                </span>
                <span className="text-[10px] text-muted font-medium block">
                  Symbiosis Institute of Technology
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-canvas/70 p-1 rounded-xl border border-hot-pink/15">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-hot-pink shadow-sm font-bold border border-hot-pink/15'
                        : 'text-muted hover:text-ink hover:bg-white/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side: Connection Status & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Server Status Indicator */}
              <div 
                onClick={handleRecheck}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white/80 cursor-pointer hover:bg-canvas transition-colors shadow-2xs"
                title="Click to recheck backend connection"
              >
                <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-present-green animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-muted hidden lg:inline">
                  {isBackendConnected ? 'Backend Live' : 'Backend Offline'}
                </span>
                <RefreshCw className={`w-3 h-3 text-muted ${isChecking ? 'animate-spin' : ''}`} />
              </div>

              {/* Student Profile Chip & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-hot-pink/20 bg-canvas/50 hover:bg-hot-pink/10 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-hot-pink/20 text-hot-pink font-bold flex items-center justify-center text-xs overflow-hidden">
                    {student?.profilePhoto ? (
                      <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      student?.name?.charAt(0) || 'S'
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-ink leading-tight truncate max-w-[110px]">
                      {student?.name || 'Student'}
                    </p>
                    <p className="text-[10px] text-muted font-plex-mono leading-tight">
                      {student?.prn || 'Sec A'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-glass border border-hot-pink/20 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="pb-3 border-b border-hot-pink/15">
                      <p className="text-xs font-bold text-ink truncate">{student?.name}</p>
                      <p className="text-[11px] font-plex-mono text-muted">{student?.prn}</p>
                      <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-canvas font-semibold text-hot-pink border border-hot-pink/20">
                          {student?.department}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-canvas font-semibold text-muted border border-hot-pink/20">
                          Sec {student?.section} • Sem {student?.semester}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onTabChange('profile');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-hot-pink hover:bg-hot-pink/5 rounded-xl transition-colors"
                      >
                        <UserRound className="w-4 h-4" />
                        <span>View My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-absent-red hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hot-pink/20 shadow-lg px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-hot-pink font-bold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-hot-pink/15' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
