import { API_BASE } from '../config/api';
import type { Student, DashboardData, TimetableEntry, AttendanceHistoryItem } from '../types';
import { MOCK_DASHBOARDS, MOCK_TIMETABLE, MOCK_HISTORY } from '../data/mockData';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

export async function loginStudent(prn: string, password: string): Promise<{ student: Student; token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prn, password })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Invalid PRN or password');
  }

  if (!data.student || !data.token) {
    throw new Error('Login response was incomplete.');
  }

  return data;
}

export async function registerStudent(data: {
  name: string;
  prn: string;
  email: string;
  password: string;
  department: string;
  section: string;
  semester: number;
}): Promise<{ student: Student; token: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to register student');
  } catch (err: any) {
    // If backend is unreachable, create local mock session
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.name === 'TypeError') {
      const newStudent: Student = {
        id: `local-${Date.now()}`,
        name: data.name,
        prn: data.prn.toUpperCase(),
        email: data.email,
        department: data.department,
        section: data.section.toUpperCase(),
        semester: data.semester
      };
      return {
        student: newStudent,
        token: `mock-jwt-token-for-${newStudent.prn}`
      };
    }
    throw err;
  }
}

export async function fetchDashboard(token: string, studentPrn?: string): Promise<DashboardData> {
  if (token && !token.startsWith('mock-')) {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to mock on network fail
    }
  }

  // Return realistic mock dashboard
  const prn = studentPrn || '25070521001';
  return MOCK_DASHBOARDS[prn] || MOCK_DASHBOARDS['25070521001'];
}

export async function fetchTimetable(token: string, day?: number): Promise<TimetableEntry[]> {
  if (token && !token.startsWith('mock-')) {
    try {
      const url = day ? `${API_BASE}/api/timetable?day=${day}` : `${API_BASE}/api/timetable`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timetable) return data.timetable;
      }
    } catch {
      // Fallback
    }
  }

  if (day) {
    return MOCK_TIMETABLE.filter(item => item.dayOfWeek === day);
  }
  return MOCK_TIMETABLE;
}

export async function fetchAttendanceHistory(token: string): Promise<AttendanceHistoryItem[]> {
  if (token && !token.startsWith('mock-')) {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.history) return data.history;
      }
    } catch {
      // Fallback
    }
  }
  return MOCK_HISTORY;
}

export async function submitAttendanceScan(
  token: string | null,
  payload: {
    qrToken: string;
    rollNo: string;
    name?: string;
    lat: number;
    lng: number;
    wifiSSID: string;
    faceVerified: boolean;
  }
): Promise<{ status: string; message: string; markedAt?: string; subject?: string }> {
  // If we have a JWT from student-backend, submit to authenticated /api/attendance/scan
  if (token && !token.startsWith('mock-')) {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken: payload.qrToken })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          status: data.status || 'present',
          message: `Attendance marked as ${data.status || 'present'}!`,
          markedAt: data.markedAt || new Date().toLocaleTimeString(),
          subject: data.subject
        };
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to mark attendance on student backend');
    } catch (err: any) {
      if (!err.message.includes('invalid, expired') && !err.message.includes('not for your class')) {
        // Fall through to public endpoint if student-backend failed with network error
      } else {
        throw err;
      }
    }
  }

  // Fallback to teacher backend public endpoint (handles direct rollNo scan)
  try {
    const res = await fetch(`${API_BASE}/api/attendance/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        status: 'present',
        message: data.message || 'Attendance Marked Successfully! 🎉',
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Scan submission failed');
  } catch (err: any) {
    // If backend is completely offline in local preview, simulate verified scan
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      return {
        status: 'present',
        message: 'Attendance recorded in Local Demo Mode! 🎉',
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    throw err;
  }
}

export async function fetchStudentProfile(token: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Unable to load student profile.');
  }

  return data.student;
}

export async function uploadStudentProfilePhoto(
  token: string,
  photo: File
): Promise<Student> {
  const formData = new FormData();
  formData.append('photo', photo);

  const res = await fetch(`${API_BASE}/api/profile/photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Unable to upload profile photo.');
  }

  return data.student;
}
