import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import type { DashboardData, AttendanceHistoryItem } from '../types';
import { fetchDashboard, fetchAttendanceHistory } from '../services/api';
import type { NavTab } from './Navbar';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calculator, 
  CalendarDays, 
  QrCode, 
  RefreshCw, 
  ArrowUpRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: NavTab, subject?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { student, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!token) return;
    Promise.all([
      fetchDashboard(token, student?.prn),
      fetchAttendanceHistory(token)
    ]).then(([dash, hist]) => {
      if (isMounted) {
        setData(dash);
        setHistory(hist);
      }
    }).catch((e) => {
      console.error('Error loading dashboard data:', e);
    }).finally(() => {
      if (isMounted) {
        setIsRefreshing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token, student?.prn, refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const attendancePct = data?.attendancePercentage || 0;
  const isEligible = attendancePct >= 75;
  const totalClasses = data?.totalClasses || 0;
  const attendedClasses = data?.attendedClasses || 0;
  const absentClasses = data?.absentClasses || 0;

  // Calculate classes needed to reach 75% if below
  const classesNeededFor75 = !isEligible && totalClasses > 0
    ? Math.max(0, Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25))
    : 0;

  // Calculate safe bunks if above 75%
  const safeBunksAllowed = isEligible && totalClasses > 0
    ? Math.max(0, Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75))
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ink via-[#231b38] to-ink text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-hot-pink/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-thistle/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-hot-pink border border-white/10 mb-3">
              <span>{student?.department}</span>
              <span>•</span>
              <span>Sec {student?.section} (Sem {student?.semester})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-sora tracking-tight">
              Welcome, {student?.name || 'Student'}! 👋
            </h1>
            <p className="text-white/70 text-xs sm:text-sm mt-1 font-mono">
              PRN: {student?.prn}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 px-5 py-2.5 bg-hot-pink hover:bg-hot-pink/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-hot-pink/30 transition-all hover:scale-[1.02]"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/15"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Exam Eligibility Banner */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-sm transition-all ${
        isEligible
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/90 border-amber-200 text-amber-950'
      }`}>
        <div className={`p-2 rounded-xl shrink-0 ${isEligible ? 'bg-emerald-100 text-present-green' : 'bg-amber-100 text-amber-600'}`}>
          {isEligible ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-sm">
              {isEligible ? 'Exam Attendance Criteria Met ✅' : 'Attendance Deficit Warning ⚠️'}
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isEligible ? 'bg-present-green/15 text-present-green' : 'bg-absent-red/15 text-absent-red'
            }`}>
              Target: 75.0%
            </span>
          </div>
          <p className="text-xs sm:text-sm mt-1 text-ink/80 leading-relaxed">
            {isEligible ? (
              <>
                Your overall attendance is <strong className="text-present-green">{attendancePct}%</strong>, safely above the mandatory 75% institutional requirement. You can safely bunk up to <strong>{safeBunksAllowed} upcoming {safeBunksAllowed === 1 ? 'class' : 'classes'}</strong>.
              </>
            ) : (
              <>
                Your overall attendance is <strong className="text-absent-red">{attendancePct}%</strong>. You must attend the next <strong className="text-absent-red">{classesNeededFor75} consecutive classes</strong> without absence to restore eligibility!
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => onNavigate('calculator')}
          className="shrink-0 hidden sm:flex items-center gap-1 text-xs font-bold text-hot-pink hover:underline self-center"
        >
          <span>Calculate</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Percentage with Radial Meter */}
        <div className="bg-white rounded-2xl p-5 border border-hot-pink/15 shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Overall Attendance</span>
            <Percent className="w-4 h-4 text-hot-pink" />
          </div>
          <div className="my-3 flex items-center justify-between">
            <span className={`text-3xl font-extrabold font-sora ${
              attendancePct >= 75 ? 'text-present-green' : attendancePct >= 65 ? 'text-amber-500' : 'text-absent-red'
            }`}>
              {attendancePct}%
            </span>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#F3F4F6"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={attendancePct >= 75 ? '#16A34A' : attendancePct >= 65 ? '#F59E0B' : '#DC2626'}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - attendancePct / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-ink">
                {Math.round(attendancePct)}%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted">
            {isEligible ? 'Above 75% requirement' : `${classesNeededFor75} classes to recover`}
          </p>
        </div>

        {/* Metric 2: Attended */}
        <div className="bg-white rounded-2xl p-5 border border-hot-pink/15 shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Classes Attended</span>
            <CheckCircle2 className="w-4 h-4 text-present-green" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-ink font-sora">
              {attendedClasses}
            </span>
            <span className="text-xs text-muted ml-1.5 font-medium">/ {totalClasses}</span>
          </div>
          <p className="text-[11px] text-present-green font-medium">
            Present & On-Duty records
          </p>
        </div>

        {/* Metric 3: Absents */}
        <div className="bg-white rounded-2xl p-5 border border-hot-pink/15 shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Missed Sessions</span>
            <XCircle className="w-4 h-4 text-absent-red" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-absent-red font-sora">
              {absentClasses}
            </span>
            <span className="text-xs text-muted ml-1.5 font-medium">lectures</span>
          </div>
          <p className="text-[11px] text-muted">
            {absentClasses === 0 ? 'Flawless record!' : 'Unmarked or missed'}
          </p>
        </div>

        {/* Metric 4: Safe Bunk / Deficit Calculator Card */}
        <div className="bg-white rounded-2xl p-5 border border-hot-pink/15 shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>{isEligible ? 'Safe Bunk Margin' : 'Recovery Target'}</span>
            <TrendingUp className="w-4 h-4 text-hot-pink" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-hot-pink font-sora">
              {isEligible ? safeBunksAllowed : classesNeededFor75}
            </span>
            <span className="text-xs text-muted ml-1.5 font-medium">
              {isEligible ? 'classes can skip' : 'must attend'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('calculator')}
            className="text-[11px] text-hot-pink hover:underline font-bold flex items-center gap-1"
          >
            <span>Open Attendance Calculator</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Quick Navigation Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('scanner')}
          className="p-4 rounded-2xl bg-gradient-to-tr from-hot-pink/10 to-white border border-hot-pink/20 hover:border-hot-pink/40 hover:shadow-md transition-all text-left flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-hot-pink text-white flex items-center justify-center shadow-md shadow-hot-pink/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">Mark Live Attendance</h4>
            <p className="text-[11px] text-muted">Scan the classroom screen QR</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('calculator')}
          className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-white border border-thistle/40 hover:border-hot-pink/40 hover:shadow-md transition-all text-left flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-thistle text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">Attendance Calculator</h4>
            <p className="text-[11px] text-muted">Simulate bunks & 75% goals</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('timetable')}
          className="p-4 rounded-2xl bg-gradient-to-tr from-blue-50 to-white border border-blue-200/50 hover:border-hot-pink/40 hover:shadow-md transition-all text-left flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">Class Timetable</h4>
            <p className="text-[11px] text-muted">Weekly lectures & halls</p>
          </div>
        </button>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-hot-pink/15 shadow-glass">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold font-sora text-ink">
              Subject-Wise Attendance Breakdown
            </h2>
            <p className="text-xs text-muted">
              Official lecture counts and percentage per course
            </p>
          </div>
          <button
            onClick={() => onNavigate('calculator')}
            className="text-xs font-bold text-hot-pink hover:underline hidden sm:inline-flex items-center gap-1"
          >
            <span>Plan with Calculator</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {data?.subjects?.map((sub, idx) => {
            const pct = sub.attendancePercentage;
            const isSubSafe = pct >= 75;
            const isSubWarning = pct >= 65 && pct < 75;

            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl border border-hot-pink/15 bg-canvas/30 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{sub.subject}</span>
                      {sub.code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-muted border border-hot-pink/15">
                          {sub.code}
                        </span>
                      )}
                    </div>
                    {sub.teacher && (
                      <span className="text-xs text-muted block mt-0.5">Faculty: {sub.teacher}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isSubSafe
                        ? 'bg-emerald-100 text-present-green'
                        : isSubWarning
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-red-100 text-absent-red'
                    }`}>
                      {isSubSafe ? 'Safe (≥75%)' : isSubWarning ? 'At Risk' : 'Critical'}
                    </span>
                    <button
                      onClick={() => onNavigate('calculator', sub.subject)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-hot-pink/20 bg-white text-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                      title="Calculate bunks for this subject"
                    >
                      Calculate
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSubSafe
                        ? 'bg-present-green'
                        : isSubWarning
                        ? 'bg-amber-500'
                        : 'bg-absent-red'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>

                {/* Subject Details Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-muted gap-2 mt-1">
                  <div className="flex items-center gap-3">
                    <span>Attended: <strong className="text-ink">{sub.attendedClasses}</strong> / {sub.totalClasses}</span>
                    <span>Missed: <strong className="text-absent-red">{sub.absentClasses}</strong></span>
                    {sub.lateClasses > 0 && (
                      <span className="text-amber-600">Late: {sub.lateClasses}</span>
                    )}
                  </div>
                  <span className={`font-bold font-sora ${
                    isSubSafe ? 'text-present-green' : isSubWarning ? 'text-amber-500' : 'text-absent-red'
                  }`}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attendance Activity Feed */}
      <div className="bg-white rounded-3xl p-6 border border-hot-pink/15 shadow-glass">
        <h3 className="text-base font-bold font-sora text-ink mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-hot-pink" />
          <span>Recent Attendance History</span>
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">No recent attendance records found.</p>
        ) : (
          <div className="divide-y divide-hot-pink/10">
            {history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    item.status === 'present'
                      ? 'bg-emerald-100 text-present-green'
                      : item.status === 'late'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-absent-red'
                  }`}>
                    {item.status === 'present' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.status === 'late' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-ink">{item.subject}</p>
                    <p className="text-[11px] text-muted">
                      {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block font-semibold px-2 py-0.5 rounded-full capitalize text-[10px] ${
                    item.status === 'present'
                      ? 'bg-emerald-100 text-present-green'
                      : item.status === 'late'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-absent-red'
                  }`}>
                    {item.status}
                  </span>
                  {item.markedAt && (
                    <p className="text-[10px] text-muted font-mono mt-0.5">{item.markedAt}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
