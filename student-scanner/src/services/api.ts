import { API_BASE } from '../config/api';
import type { Student, DashboardData, TimetableEntry, AttendanceHistoryItem } from '../types';

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
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error || 'Failed to register student');
  if (!result.student || !result.token) throw new Error('Registration response was incomplete.');
  return result;
}


export async function fetchDashboard(token: string, _studentPrn?: string): Promise<DashboardData> {
  if (!token || token.startsWith('mock-')) throw new Error('Please log in again.');
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Unable to load dashboard.');
  return data;
}


export async function fetchTimetable(token: string, day?: number): Promise<TimetableEntry[]> {
  if (!token || token.startsWith('mock-')) throw new Error('Please log in again.');
  const url = day ? `${API_BASE}/api/timetable?day=${day}` : `${API_BASE}/api/timetable`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Unable to load timetable.');
  if (!Array.isArray(data.timetable)) throw new Error('Invalid timetable response.');
  return data.timetable;
}


export async function fetchAttendanceHistory(token: string): Promise<AttendanceHistoryItem[]> {
  if (!token || token.startsWith('mock-')) throw new Error('Please log in again.');
  const res = await fetch(`${API_BASE}/api/attendance/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Unable to load attendance history.');
  if (!Array.isArray(data.history)) throw new Error('Invalid attendance history response.');
  return data.history;
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
    throw new Error(
      err.message || 'Unable to submit attendance. Please check your connection and try again.'
    );
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
