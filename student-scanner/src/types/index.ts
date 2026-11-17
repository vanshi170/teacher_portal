export interface Student {
  id: string;
  name: string;
  prn: string;
  email: string;
  department: string;
  section: string;
  semester: number;
  profilePhoto?: string;
}

export interface SubjectAttendance {
  subject: string;
  code?: string;
  teacher?: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendancePercentage: number;
}

export interface DashboardData {
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  subjects: SubjectAttendance[];
}

export interface TimetableEntry {
  id?: string;
  department: string;
  section: string;
  semester: number;
  dayOfWeek: number; // 1 = Monday, ..., 6 = Saturday
  subject: string;
  code?: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  classroom: string; // "CL-101", "Lab 10"
  teacher?: string;
  type?: 'lecture' | 'lab' | 'tutorial';
}

export interface AttendanceHistoryItem {
  sessionId: string;
  subject: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  markedAt: string | null;
}

export interface AuthState {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  isBackendConnected: boolean;
}
