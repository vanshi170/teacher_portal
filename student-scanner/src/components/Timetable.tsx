import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/useAuth';
import type { TimetableEntry } from '../types';
import { fetchTimetable } from '../services/api';
import type { NavTab } from './Navbar';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  QrCode, 
  Grid3X3, 
  ListFilter
} from 'lucide-react';

interface TimetableProps {
  onNavigate: (tab: NavTab) => void;
}

const DAYS = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' }
];

export const Timetable: React.FC<TimetableProps> = ({ onNavigate }) => {
  const { student, token } = useAuth();
  
  // Default to today's day of week (1=Mon..6=Sat). If Sunday (0), default to Monday (1)
  const [todayDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 6 ? d : 1;
  });

  const [selectedDay, setSelectedDay] = useState<number>(todayDay);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    if (token) {
      fetchTimetable(token).then((data) => {
        setSchedule(data);
      });
    }
  }, [token, student?.section, student?.semester]);

  // Filter schedule for selected day
  const dailyLectures = useMemo(() => {
    return schedule
      .filter((item) => item.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule, selectedDay]);

  // Derive current time string
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isTodaySelected = selectedDay === todayDay;

  // Find ongoing or next lecture today
  const ongoingLecture = isTodaySelected
    ? dailyLectures.find(l => currentTimeStr >= l.startTime && currentTimeStr <= l.endTime)
    : null;

  const nextLecture = isTodaySelected
    ? dailyLectures.find(l => currentTimeStr < l.startTime)
    : null;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hot-pink/10 text-hot-pink text-xs font-bold mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Academic Schedule • {student?.department || 'Computer Science'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-sora text-ink">
              Class Timetable
            </h1>
            <p className="text-muted text-xs sm:text-sm mt-1">
              Section {student?.section || 'A'} • Semester {student?.semester || 4} • Official Classroom Allocations
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-hot-pink/15 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-hot-pink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-hot-pink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Full Week Grid</span>
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        {viewMode === 'day' && (
          <div className="mt-6 pt-5 border-t border-hot-pink/15 flex flex-wrap items-center gap-2">
            {DAYS.map((d) => {
              const isSelected = selectedDay === d.id;
              const isToday = d.id === todayDay;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-hot-pink text-white shadow-md shadow-hot-pink/25 scale-105'
                      : 'bg-canvas text-muted hover:text-ink hover:bg-hot-pink/10 border border-hot-pink/15'
                  }`}
                >
                  <span>{d.full}</span>
                  {isToday && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-hot-pink text-white'
                    }`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ongoing / Next Class Live Highlight Banner */}
      {isTodaySelected && (ongoingLecture || nextLecture) && viewMode === 'day' && (
        <div className="bg-gradient-to-r from-ink via-[#2a1b3d] to-ink text-white rounded-3xl p-6 border border-hot-pink/30 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-hot-pink/20 text-hot-pink border border-hot-pink/30 mb-2">
                <span className="w-2 h-2 rounded-full bg-present-green animate-pulse" />
                <span>{ongoingLecture ? 'Class In Session Now' : 'Up Next Today'}</span>
              </div>
              <h3 className="text-xl font-bold font-sora">
                {(ongoingLecture || nextLecture)?.subject}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-hot-pink" />
                  {(ongoingLecture || nextLecture)?.startTime} - {(ongoingLecture || nextLecture)?.endTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-hot-pink" />
                  Room: {(ongoingLecture || nextLecture)?.classroom}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-hot-pink" />
                  Faculty: {(ongoingLecture || nextLecture)?.teacher}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 px-5 py-2.5 bg-hot-pink hover:bg-hot-pink/90 text-white text-xs font-bold rounded-xl shadow-lg shadow-hot-pink/30 transition-all hover:scale-105 shrink-0 self-start md:self-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR for Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* Day View Timeline */}
      {viewMode === 'day' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-sora text-ink">
              {DAYS.find(d => d.id === selectedDay)?.full} Schedule
            </h2>
            <span className="text-xs font-semibold text-muted">
              {dailyLectures.length} {dailyLectures.length === 1 ? 'Session' : 'Sessions'} Scheduled
            </span>
          </div>

          {dailyLectures.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <CalendarDays className="w-12 h-12 text-hot-pink/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-ink">No lectures scheduled for this day</p>
              <p className="text-xs text-muted mt-1">Enjoy your study holiday or revision time!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyLectures.map((item, idx) => {
                const isOngoing = isTodaySelected && currentTimeStr >= item.startTime && currentTimeStr <= item.endTime;
                const isCompleted = isTodaySelected && currentTimeStr > item.endTime;

                return (
                  <div
                    key={item.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isOngoing
                        ? 'bg-gradient-to-r from-pink-50 via-white to-purple-50/40 border-hot-pink shadow-md'
                        : isCompleted
                        ? 'bg-gray-50/60 border-gray-200 opacity-80'
                        : 'bg-canvas/30 border-hot-pink/15 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left: Time and Subject */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white border border-hot-pink/15 text-center min-w-[90px] shadow-2xs">
                          <span className="block text-xs font-extrabold text-ink font-mono">
                            {item.startTime}
                          </span>
                          <span className="block text-[10px] text-muted font-medium">to</span>
                          <span className="block text-xs font-bold text-muted font-mono">
                            {item.endTime}
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sm text-ink">{item.subject}</h3>
                            {item.code && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-muted border border-hot-pink/15">
                                {item.code}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              item.type === 'lab'
                                ? 'bg-purple-100 text-purple-700'
                                : item.type === 'tutorial'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.type || 'lecture'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                            <span className="flex items-center gap-1 text-ink font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-hot-pink" />
                              {item.classroom}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-muted" />
                              {item.teacher}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status and QR action */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isOngoing ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-present-green/15 text-present-green flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-present-green animate-pulse" />
                              Live Now
                            </span>
                            <button
                              onClick={() => onNavigate('scanner')}
                              className="px-3 py-1.5 bg-hot-pink text-white rounded-xl text-xs font-bold shadow-sm hover:bg-hot-pink/90 transition-all flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Scan</span>
                            </button>
                          </div>
                        ) : isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-gray-400" />
                            Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-canvas text-muted border border-hot-pink/15">
                            Upcoming
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Week Grid View */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hot-pink/15 shadow-glass overflow-x-auto">
          <h2 className="text-lg font-bold font-sora text-ink mb-4">
            Weekly Schedule Matrix (Mon - Sat)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((d) => {
              const dayItems = schedule.filter(item => item.dayOfWeek === d.id);
              const isToday = d.id === todayDay;

              return (
                <div 
                  key={d.id}
                  className={`p-4 rounded-2xl border ${
                    isToday ? 'border-hot-pink bg-pink-50/30' : 'border-hot-pink/15 bg-canvas/30'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-hot-pink/15">
                    <span className="font-bold text-sm text-ink">{d.full}</span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-hot-pink text-white">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-muted py-2 italic">No lectures</p>
                    ) : (
                      dayItems.map((item, i) => (
                        <div key={i} className="text-xs p-2 rounded-xl bg-white border border-hot-pink/10 shadow-2xs">
                          <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-1">
                            <span>{item.startTime} - {item.endTime}</span>
                            <span className="font-semibold text-hot-pink">{item.classroom}</span>
                          </div>
                          <p className="font-bold text-ink leading-tight">{item.subject}</p>
                          <p className="text-[10px] text-muted mt-0.5">{item.teacher}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
