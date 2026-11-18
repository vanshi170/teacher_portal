import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Wifi,
  ShieldCheck
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, isBackendConnected, recheckConnection } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginPrn, setLoginPrn] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [name, setName] = useState('');
  const [regPrn, setRegPrn] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState(4);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!loginPrn.trim()) {
    setError('Invalid details: Please enter your PRN.');
    return;
  }

  if (!/^[0-9]+$/.test(loginPrn.trim())) {
    setError('Invalid details: PRN must contain numbers only.');
    return;
  }

  if (!loginPassword.trim()) {
    setError('Please enter your password.');
    return;
  }

  setIsSubmitting(true);

  try {
    await login(loginPrn.trim(), loginPassword);
    if (onSuccess) onSuccess();
  } catch (err: any) {
    setError(err.message || 'Failed to sign in. Please verify your PRN and password.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !regPrn.trim() || !email.trim() || !regPassword.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        prn: regPrn.trim(),
        email: email.trim(),
        password: regPassword,
        department,
        section,
        semester
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-hot-pink/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-thistle/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-hot-pink to-thistle shadow-lg shadow-hot-pink/25 mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-sora tracking-tight">
            Student Attendance Portal
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-Time Attendance, Timetable & Smart Calculator
          </p>
          
          {/* Connection Status Pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-white/70 backdrop-blur-sm shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-present-green animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-muted">
              {isBackendConnected ? 'Backend Server Online (Port 10000)' : 'Backend connection unavailable'}
            </span>
            <button 
              onClick={() => recheckConnection()} 
              className="ml-1 text-[10px] text-hot-pink underline hover:text-hot-pink/80"
              title="Re-check backend API health"
            >
              check
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md border border-hot-pink/20 rounded-2xl shadow-glass p-6 sm:p-8">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-canvas p-1 mb-6 border border-hot-pink/15">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              New Student Registration
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-absent-red text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  PRN / Roll Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginPrn}
                    onChange={(e) => setLoginPrn(e.target.value)}
                    placeholder="e.g. 25070521001"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 focus:border-hot-pink font-plex-mono text-ink placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 focus:border-hot-pink text-ink placeholder:text-muted/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-hot-pink to-[#E05D97] hover:from-[#E05D97] hover:to-hot-pink text-white font-semibold text-sm rounded-xl shadow-md shadow-hot-pink/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Tab 2: Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arushi Varghese"
                  className="w-full px-3.5 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    PRN / Roll No
                  </label>
                  <input
                    type="text"
                    value={regPrn}
                    onChange={(e) => setRegPrn(e.target.value)}
                    placeholder="25070521001"
                    className="w-full px-3.5 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 font-plex-mono text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="E">Section E</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@sitnagpur.edu.in"
                  className="w-full px-3.5 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Password (min 8 characters)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2 text-sm bg-canvas/60 border border-hot-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-hot-pink/50 text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-hot-pink to-[#E05D97] hover:from-[#E05D97] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          </div>

        {/* Security Footer */}
        <div className="mt-4 text-center flex items-center justify-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-present-green" />
            Biometric Face & GPS Protected
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-hot-pink" />
            Campus Wi-Fi Verified
          </span>
        </div>

      </div>
    </div>
  );
};
