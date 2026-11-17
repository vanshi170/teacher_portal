import type { Student, DashboardData, TimetableEntry, AttendanceHistoryItem } from '../types';

export const DEMO_STUDENTS: (Student & { demoDescription: string; defaultAttendance: number })[] = [
  {
    id: 'demo-1',
    name: 'ARUSHI VARGHESE',
    prn: '25070521001',
    email: 'arushi.varghese@sitnagpur.edu.in',
    department: 'Computer Science',
    section: 'A',
    semester: 4,
    demoDescription: 'Sec A • High Attendance (85.7%)',
    defaultAttendance: 85.7
  },
  {
    id: 'demo-2',
    name: 'LARANYA SHENDE',
    prn: '25070521002',
    email: 'laranya.shende@sitnagpur.edu.in',
    department: 'Computer Science',
    section: 'A',
    semester: 4,
    demoDescription: 'Sec A • Attendance Alert (71.4%)',
    defaultAttendance: 71.4
  },
  {
    id: 'demo-3',
    name: 'ADITYA RAJ',
    prn: '25070521142',
    email: 'aditya.raj@sitnagpur.edu.in',
    department: 'Computer Science',
    section: 'C',
    semester: 4,
    demoDescription: 'Sec C • Top Attendance (92.5%)',
    defaultAttendance: 92.5
  },
  {
    id: 'demo-4',
    name: 'HARSHINI S J',
    prn: '25070521004',
    email: 'harshini.sj@sitnagpur.edu.in',
    department: 'Computer Science',
    section: 'A',
    semester: 4,
    demoDescription: 'Sec A • Borderline (75.0%)',
    defaultAttendance: 75.0
  }
];

export const MOCK_DASHBOARDS: Record<string, DashboardData> = {
  '25070521001': {
    totalClasses: 28,
    attendedClasses: 24,
    absentClasses: 4,
    attendancePercentage: 85.71,
    subjects: [
      {
        subject: 'Design Analysis & Algorithms',
        code: 'CS401',
        teacher: 'Dr. Rajiv Sen',
        totalClasses: 8,
        attendedClasses: 7,
        absentClasses: 1,
        lateClasses: 1,
        attendancePercentage: 87.5
      },
      {
        subject: 'Microcontroller & Sensors',
        code: 'CS402',
        teacher: 'Prof. Vanshiii G.',
        totalClasses: 7,
        attendedClasses: 6,
        absentClasses: 1,
        lateClasses: 0,
        attendancePercentage: 85.71
      },
      {
        subject: 'Computer Organization',
        code: 'CS403',
        teacher: 'Dr. Neha Kulkarni',
        totalClasses: 6,
        attendedClasses: 5,
        absentClasses: 1,
        lateClasses: 1,
        attendancePercentage: 83.33
      },
      {
        subject: 'Discrete Mathematics & Graph Theory',
        code: 'CS404',
        teacher: 'Prof. Alok Verma',
        totalClasses: 4,
        attendedClasses: 4,
        absentClasses: 0,
        lateClasses: 0,
        attendancePercentage: 100.0
      },
      {
        subject: 'Design Analysis & Algorithms Lab',
        code: 'CS401L',
        teacher: 'Dr. Rajiv Sen',
        totalClasses: 3,
        attendedClasses: 2,
        absentClasses: 1,
        lateClasses: 0,
        attendancePercentage: 66.67
      }
    ]
  },
  '25070521002': {
    totalClasses: 28,
    attendedClasses: 20,
    absentClasses: 8,
    attendancePercentage: 71.43,
    subjects: [
      {
        subject: 'Design Analysis & Algorithms',
        code: 'CS401',
        teacher: 'Dr. Rajiv Sen',
        totalClasses: 8,
        attendedClasses: 5,
        absentClasses: 3,
        lateClasses: 0,
        attendancePercentage: 62.5
      },
      {
        subject: 'Microcontroller & Sensors',
        code: 'CS402',
        teacher: 'Prof. Vanshiii G.',
        totalClasses: 7,
        attendedClasses: 5,
        absentClasses: 2,
        lateClasses: 1,
        attendancePercentage: 71.43
      },
      {
        subject: 'Computer Organization',
        code: 'CS403',
        teacher: 'Dr. Neha Kulkarni',
        totalClasses: 6,
        attendedClasses: 5,
        absentClasses: 1,
        lateClasses: 0,
        attendancePercentage: 83.33
      },
      {
        subject: 'Discrete Mathematics & Graph Theory',
        code: 'CS404',
        teacher: 'Prof. Alok Verma',
        totalClasses: 4,
        attendedClasses: 3,
        absentClasses: 1,
        lateClasses: 0,
        attendancePercentage: 75.0
      },
      {
        subject: 'Design Analysis & Algorithms Lab',
        code: 'CS401L',
        teacher: 'Dr. Rajiv Sen',
        totalClasses: 3,
        attendedClasses: 2,
        absentClasses: 1,
        lateClasses: 0,
        attendancePercentage: 66.67
      }
    ]
  }
};

export const MOCK_TIMETABLE: TimetableEntry[] = [
  // Monday
  { id: 't1', dayOfWeek: 1, department: 'Computer Science', section: 'A', semester: 4, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { id: 't2', dayOfWeek: 1, department: 'Computer Science', section: 'A', semester: 4, subject: 'Microcontroller & Sensors', code: 'CS402', startTime: '10:00', endTime: '11:00', classroom: 'CL-102', teacher: 'Prof. Vanshiii G.', type: 'lecture' },
  { id: 't3', dayOfWeek: 1, department: 'Computer Science', section: 'A', semester: 4, subject: 'Computer Organization', code: 'CS403', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { id: 't4', dayOfWeek: 1, department: 'Computer Science', section: 'A', semester: 4, subject: 'Design Analysis & Algorithms Lab', code: 'CS401L', startTime: '13:00', endTime: '15:00', classroom: 'Lab 10', teacher: 'Dr. Rajiv Sen', type: 'lab' },

  // Tuesday
  { id: 't5', dayOfWeek: 2, department: 'Computer Science', section: 'A', semester: 4, subject: 'Discrete Mathematics & Graph Theory', code: 'CS404', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Prof. Alok Verma', type: 'lecture' },
  { id: 't6', dayOfWeek: 2, department: 'Computer Science', section: 'A', semester: 4, subject: 'Machine Learning Fundamentals', code: 'CS405', startTime: '10:00', endTime: '11:00', classroom: 'CL-103', teacher: 'Dr. Priya Nair', type: 'lecture' },
  { id: 't7', dayOfWeek: 2, department: 'Computer Science', section: 'A', semester: 4, subject: 'Introduction to Cyber Security', code: 'CS406', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Prof. Vikram Rao', type: 'lecture' },
  { id: 't8', dayOfWeek: 2, department: 'Computer Science', section: 'A', semester: 4, subject: 'Microcontroller & Sensors Lab', code: 'CS402L', startTime: '13:00', endTime: '15:00', classroom: 'Hardware Lab 2', teacher: 'Prof. Vanshiii G.', type: 'lab' },

  // Wednesday
  { id: 't9', dayOfWeek: 3, department: 'Computer Science', section: 'A', semester: 4, subject: 'Computer Organization', code: 'CS403', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { id: 't10', dayOfWeek: 3, department: 'Computer Science', section: 'A', semester: 4, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { id: 't11', dayOfWeek: 3, department: 'Computer Science', section: 'A', semester: 4, subject: 'Project Based Learning', code: 'CS407', startTime: '11:15', endTime: '13:15', classroom: 'Project Hub', teacher: 'Prof. S. Mehta', type: 'lab' },
  { id: 't12', dayOfWeek: 3, department: 'Computer Science', section: 'A', semester: 4, subject: 'Aptitude & Reasoning', code: 'GS401', startTime: '14:00', endTime: '15:00', classroom: 'Auditorium B', teacher: 'Guest Mentor', type: 'tutorial' },

  // Thursday
  { id: 't13', dayOfWeek: 4, department: 'Computer Science', section: 'A', semester: 4, subject: 'Microcontroller & Sensors', code: 'CS402', startTime: '09:00', endTime: '10:00', classroom: 'CL-102', teacher: 'Prof. Vanshiii G.', type: 'lecture' },
  { id: 't14', dayOfWeek: 4, department: 'Computer Science', section: 'A', semester: 4, subject: 'Discrete Mathematics & Graph Theory', code: 'CS404', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Prof. Alok Verma', type: 'lecture' },
  { id: 't15', dayOfWeek: 4, department: 'Computer Science', section: 'A', semester: 4, subject: 'Machine Learning Fundamentals', code: 'CS405', startTime: '11:15', endTime: '12:15', classroom: 'CL-103', teacher: 'Dr. Priya Nair', type: 'lecture' },
  { id: 't16', dayOfWeek: 4, department: 'Computer Science', section: 'A', semester: 4, subject: 'Group Discussion', code: 'GS402', startTime: '13:00', endTime: '14:00', classroom: 'Seminar Hall 1', teacher: 'Dr. Ananya Roy', type: 'tutorial' },

  // Friday
  { id: 't17', dayOfWeek: 5, department: 'Computer Science', section: 'A', semester: 4, subject: 'Introduction to Cyber Security', code: 'CS406', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Prof. Vikram Rao', type: 'lecture' },
  { id: 't18', dayOfWeek: 5, department: 'Computer Science', section: 'A', semester: 4, subject: 'Computer Organization', code: 'CS403', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { id: 't19', dayOfWeek: 5, department: 'Computer Science', section: 'A', semester: 4, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { id: 't20', dayOfWeek: 5, department: 'Computer Science', section: 'A', semester: 4, subject: 'Mentor Mentee Session', code: 'GS403', startTime: '14:00', endTime: '15:00', classroom: 'Faculty Lounge 3', teacher: 'Assigned Mentor', type: 'tutorial' },

  // Saturday
  { id: 't21', dayOfWeek: 6, department: 'Computer Science', section: 'A', semester: 4, subject: 'SEC Technical Seminar', code: 'CS408', startTime: '09:30', endTime: '11:30', classroom: 'Lab 10', teacher: 'Tech Lead', type: 'lecture' },
  { id: 't22', dayOfWeek: 6, department: 'Computer Science', section: 'A', semester: 4, subject: 'Flexi Credit Workshop', code: 'FC401', startTime: '12:00', endTime: '14:00', classroom: 'Online / Lab 3', teacher: 'Industry Expert', type: 'tutorial' }
];

export const MOCK_HISTORY: AttendanceHistoryItem[] = [
  {
    sessionId: 's-101',
    subject: 'Design Analysis & Algorithms',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'present',
    markedAt: new Date(Date.now() - 2 * 3600 * 1000 + 4 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    sessionId: 's-102',
    subject: 'Microcontroller & Sensors',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'present',
    markedAt: new Date(Date.now() - 24 * 3600 * 1000 + 6 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    sessionId: 's-103',
    subject: 'Computer Organization',
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'late',
    markedAt: new Date(Date.now() - 48 * 3600 * 1000 + 14 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    sessionId: 's-104',
    subject: 'Discrete Mathematics & Graph Theory',
    date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'absent',
    markedAt: null
  }
];
