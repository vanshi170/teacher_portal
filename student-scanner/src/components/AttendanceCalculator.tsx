import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import type { DashboardData } from '../types';
import { fetchDashboard } from '../services/api';
import { 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders
} from 'lucide-react';

interface AttendanceCalculatorProps {
  initialSubject?: string;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({ initialSubject }) => {
  const { student, token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  
  // Calculator inputs
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'ALL');
  const [prevInitialSubject, setPrevInitialSubject] = useState(initialSubject);

  if (initialSubject !== prevInitialSubject) {
    setPrevInitialSubject(initialSubject);
    setSelectedSubject(initialSubject || 'ALL');
  }
  
  // Custom mode values
  const [customAttended, setCustomAttended] = useState<number>(20);
  const [customTotal, setCustomTotal] = useState<number>(25);

  // What-if simulator values
  const [simulateAttend, setSimulateAttend] = useState<number>(4);
  const [simulateBunk, setSimulateBunk] = useState<number>(0);

  useEffect(() => {
    if (token) {
      fetchDashboard(token, student?.prn).then((data) => {
        setDashboard(data);
      });
    }
  }, [token, student?.prn]);

  // Derive current values based on selected scope
  let currentAttended = 0;
  let currentTotal = 0;
  let subjectName = 'Overall Attendance';

  if (selectedSubject === 'CUSTOM') {
    currentAttended = Math.max(0, customAttended);
    currentTotal = Math.max(currentAttended, customTotal);
    subjectName = 'Custom Calculation';
  } else if (selectedSubject === 'ALL') {
    currentAttended = dashboard?.attendedClasses || 24;
    currentTotal = dashboard?.totalClasses || 28;
    subjectName = 'Overall Attendance (All Subjects)';
  } else {
    const sub = dashboard?.subjects.find(s => s.subject === selectedSubject);
    currentAttended = sub?.attendedClasses || 0;
    currentTotal = sub?.totalClasses || 0;
    subjectName = selectedSubject;
  }

  const currentPercentage = currentTotal > 0
    ? Number(((currentAttended / currentTotal) * 100).toFixed(2))
    : 0;

  const targetDecimal = targetPercentage / 100;

  // Calculation 1: Classes to attend to reach target
  // Formula: (attended + x) / (total + x) >= target
  // x >= (target * total - attended) / (1 - target)
  const isCurrentlyMeetingTarget = currentPercentage >= targetPercentage;
  
  let classesToAttend = 0;
  if (!isCurrentlyMeetingTarget && targetDecimal < 1) {
    classesToAttend = Math.max(
      0,
      Math.ceil((targetDecimal * currentTotal - currentAttended) / (1 - targetDecimal))
    );
  }

  // Calculation 2: Safe bunks (classes you can miss and still maintain >= target)
  // Formula: attended / (total + y) >= target
  // y <= (attended - target * total) / target
  let safeBunks = 0;
  if (isCurrentlyMeetingTarget && targetDecimal > 0) {
    safeBunks = Math.max(
      0,
      Math.floor((currentAttended - targetDecimal * currentTotal) / targetDecimal)
    );
  }

  // Calculation 3: Projected percentage after safe bunks
  const projectedAfterBunks = currentTotal + safeBunks > 0
    ? Number(((currentAttended / (currentTotal + safeBunks)) * 100).toFixed(2))
    : 0;

  // Calculation 4: Projected percentage after required classes
  const projectedAfterAttend = currentTotal + classesToAttend > 0
    ? Number((((currentAttended + classesToAttend) / (currentTotal + classesToAttend)) * 100).toFixed(2))
    : 0;

  // Simulation:
  const simTotal = currentTotal + simulateAttend + simulateBunk;
  const simAttended = currentAttended + simulateAttend;
  const simulatedPercentage = simTotal > 0
    ? Number(((simAttended / simTotal) * 100).toFixed(2))
    : 0;
  const simDiff = Number((simulatedPercentage - currentPercentage).toFixed(2));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hot-pink/10 text-hot-pink text-xs font-bold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Smart Bunk & Attendance Forecaster</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-sora text-ink">
              Attendance Calculator
            </h1>
            <p className="text-muted text-xs sm:text-sm mt-1">
              Know exactly how many lectures you can safely skip or need to attend to hit your university attendance criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Target Requirement:</span>
            {[75, 80, 85].map((pct) => (
              <button
                key={pct}
                onClick={() => setTargetPercentage(pct)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  targetPercentage === pct
                    ? 'bg-hot-pink text-white shadow-md shadow-hot-pink/20 scale-105'
                    : 'bg-canvas text-ink hover:bg-hot-pink/10 border border-hot-pink/20'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Scope Selector: Overall vs Specific Subject vs Custom */}
        <div className="mt-6 pt-5 border-t border-hot-pink/15">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Select Subject or Scope:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedSubject === 'ALL'
                  ? 'bg-ink text-white shadow-sm'
                  : 'bg-canvas text-muted hover:text-ink border border-hot-pink/15'
              }`}
            >
              📊 Overall Attendance
            </button>
            {dashboard?.subjects?.map((sub) => (
              <button
                key={sub.subject}
                onClick={() => setSelectedSubject(sub.subject)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedSubject === sub.subject
                    ? 'bg-hot-pink text-white shadow-sm font-bold'
                    : 'bg-canvas text-muted hover:text-ink border border-hot-pink/15'
                }`}
              >
                {sub.subject} ({sub.attendancePercentage}%)
              </button>
            ))}
            <button
              onClick={() => setSelectedSubject('CUSTOM')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedSubject === 'CUSTOM'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-canvas text-muted hover:text-ink border border-hot-pink/15'
              }`}
            >
              ⚙️ Custom Numbers
            </button>
          </div>
        </div>

        {/* Custom Input Fields if CUSTOM selected */}
        {selectedSubject === 'CUSTOM' && (
          <div className="mt-4 p-4 rounded-2xl bg-canvas/60 border border-hot-pink/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Classes Attended So Far:
              </label>
              <input
                type="number"
                min="0"
                value={customAttended}
                onChange={(e) => setCustomAttended(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white border border-hot-pink/20 rounded-xl font-bold font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Total Classes Conducted:
              </label>
              <input
                type="number"
                min={customAttended}
                value={customTotal}
                onChange={(e) => setCustomTotal(Math.max(customAttended, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white border border-hot-pink/20 rounded-xl font-bold font-mono text-ink text-sm"
              />
            </div>
          </div>
        )}

      </div>

      {/* Target Result Banner: The Big Takeaway */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-glass transition-all ${
        isCurrentlyMeetingTarget
          ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-300'
          : 'bg-gradient-to-br from-red-50 via-white to-amber-50/50 border-red-300'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isCurrentlyMeetingTarget
                  ? 'bg-present-green/15 text-present-green'
                  : 'bg-absent-red/15 text-absent-red'
              }`}>
                {isCurrentlyMeetingTarget ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isCurrentlyMeetingTarget ? `Target Met (≥ ${targetPercentage}%)` : `Below Target (< ${targetPercentage}%)`}
              </span>
              <span className="text-xs font-semibold text-muted">
                Scope: {subjectName}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-sora ${
                isCurrentlyMeetingTarget ? 'text-present-green' : 'text-absent-red'
              }`}>
                {currentPercentage}%
              </span>
              <span className="text-sm text-muted font-medium">
                ({currentAttended} attended out of {currentTotal} classes)
              </span>
            </div>

            {/* Main Actionable Sentence */}
            <div className="text-sm sm:text-base font-medium text-ink pt-1 leading-relaxed">
              {isCurrentlyMeetingTarget ? (
                <div>
                  <p className="text-present-green font-bold text-lg mb-1">
                    🎉 You can safely bunk {safeBunks} {safeBunks === 1 ? 'class' : 'classes'}!
                  </p>
                  <p className="text-muted text-xs sm:text-sm">
                    Even if you skip the next <strong>{safeBunks} classes</strong> consecutively, your attendance will stay at <strong>{projectedAfterBunks}%</strong> (above your {targetPercentage}% requirement).
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-absent-red font-bold text-lg mb-1">
                    🚨 Attend the next {classesToAttend} consecutive classes!
                  </p>
                  <p className="text-muted text-xs sm:text-sm">
                    You cannot afford any more bunks right now. Attend the next <strong>{classesToAttend} consecutive lectures</strong> without missing to bring your attendance up to <strong>{projectedAfterAttend}%</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metric Highlights Pill */}
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-hot-pink/15 shadow-sm min-w-[240px] flex flex-col justify-center">
            <div className="text-xs text-muted font-semibold mb-2">Calculation Breakdown</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-muted">Chosen Target</span>
                <span className="font-bold text-ink">{targetPercentage}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-muted">Current Attendance</span>
                <span className="font-bold text-ink">{currentPercentage}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-muted">{isCurrentlyMeetingTarget ? 'Safe Skips Available' : 'Classes Needed'}</span>
                <span className={`font-bold font-sora text-sm ${isCurrentlyMeetingTarget ? 'text-present-green' : 'text-absent-red'}`}>
                  {isCurrentlyMeetingTarget ? `${safeBunks} classes` : `${classesToAttend} classes`}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive What-If Simulation Tool */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-hot-pink" />
          <h2 className="text-lg font-bold font-sora text-ink">
            Interactive "What-If" Simulator
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted mb-6">
          Adjust the sliders below to see in real-time how upcoming attendances or skips will impact your percentage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Sliders Box */}
          <div className="space-y-5 bg-canvas/40 p-5 rounded-2xl border border-hot-pink/15">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-present-green flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>If I attend the next:</span>
                </label>
                <span className="text-sm font-extrabold text-present-green font-mono">
                  +{simulateAttend} classes
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={simulateAttend}
                onChange={(e) => setSimulateAttend(parseInt(e.target.value) || 0)}
                className="w-full accent-present-green cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-absent-red flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>If I miss / bunk the next:</span>
                </label>
                <span className="text-sm font-extrabold text-absent-red font-mono">
                  +{simulateBunk} classes
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simulateBunk}
                onChange={(e) => setSimulateBunk(parseInt(e.target.value) || 0)}
                className="w-full accent-absent-red cursor-pointer"
              />
            </div>
          </div>

          {/* Resulting Simulator Gauge */}
          <div className="bg-gradient-to-br from-white to-canvas/60 p-6 rounded-2xl border border-hot-pink/20 text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
              Projected Final Attendance
            </span>
            <div className="flex items-center justify-center gap-3 my-2">
              <span className="text-2xl font-bold text-muted line-through">
                {currentPercentage}%
              </span>
              <span className="text-xl text-hot-pink">➔</span>
              <span className={`text-4xl sm:text-5xl font-extrabold font-sora ${
                simulatedPercentage >= targetPercentage ? 'text-present-green' : 'text-absent-red'
              }`}>
                {simulatedPercentage}%
              </span>
            </div>

            <p className="text-xs font-semibold text-muted">
              Projected {simAttended} attended of {simTotal} total sessions
            </p>

            <div className={`mt-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
              simDiff >= 0 ? 'bg-emerald-100 text-present-green' : 'bg-red-100 text-absent-red'
            }`}>
              {simDiff >= 0 ? `▲ +${simDiff}% gain` : `▼ ${simDiff}% drop`}
            </div>
          </div>

        </div>
      </div>

      {/* Comprehensive Subject-by-Subject Bunk/Attend Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass">
        <h2 className="text-lg font-bold font-sora text-ink mb-1">
          Subject-by-Subject Bunk Matrix (Target: {targetPercentage}%)
        </h2>
        <p className="text-xs text-muted mb-4">
          Quick glance table showing your current margin or deficit for each course
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-hot-pink/15 text-muted uppercase font-semibold text-[11px]">
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Current</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hot-pink/10">
              {dashboard?.subjects?.map((sub) => {
                const pct = sub.attendancePercentage;
                const isSafe = pct >= targetPercentage;
                const reqToAttend = !isSafe
                  ? Math.max(0, Math.ceil((targetDecimal * sub.totalClasses - sub.attendedClasses) / (1 - targetDecimal)))
                  : 0;
                const safeSkips = isSafe
                  ? Math.max(0, Math.floor((sub.attendedClasses - targetDecimal * sub.totalClasses) / targetDecimal))
                  : 0;

                return (
                  <tr key={sub.subject} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-ink">{sub.subject}</p>
                      <span className="text-[10px] text-muted">{sub.attendedClasses}/{sub.totalClasses} classes</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-bold font-sora ${isSafe ? 'text-present-green' : 'text-absent-red'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSafe ? 'bg-emerald-100 text-present-green' : 'bg-red-100 text-absent-red'
                      }`}>
                        {isSafe ? 'Eligible' : 'At Risk'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium">
                      {isSafe ? (
                        <span className="text-present-green font-bold">
                          Safe to bunk {safeSkips} {safeSkips === 1 ? 'class' : 'classes'}
                        </span>
                      ) : (
                        <span className="text-absent-red font-bold">
                          Must attend {reqToAttend} more
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
