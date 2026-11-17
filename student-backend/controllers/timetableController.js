import Timetable from '../models/Timetable.js';

// Predefined realistic default schedules if database doesn't have custom records yet
const DEFAULT_SCHEDULE = [
  // Monday
  { dayOfWeek: 1, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { dayOfWeek: 1, subject: 'Microcontroller & Sensors', code: 'CS402', startTime: '10:00', endTime: '11:00', classroom: 'CL-102', teacher: 'Prof. Vanshiii G.', type: 'lecture' },
  { dayOfWeek: 1, subject: 'Computer Organization', code: 'CS403', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { dayOfWeek: 1, subject: 'Design Analysis & Algorithms Lab', code: 'CS401L', startTime: '13:00', endTime: '15:00', classroom: 'Lab 10', teacher: 'Dr. Rajiv Sen', type: 'lab' },

  // Tuesday
  { dayOfWeek: 2, subject: 'Discrete Mathematics & Graph Theory', code: 'CS404', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Prof. Alok Verma', type: 'lecture' },
  { dayOfWeek: 2, subject: 'Machine Learning Fundamentals', code: 'CS405', startTime: '10:00', endTime: '11:00', classroom: 'CL-103', teacher: 'Dr. Priya Nair', type: 'lecture' },
  { dayOfWeek: 2, subject: 'Introduction to Cyber Security', code: 'CS406', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Prof. Vikram Rao', type: 'lecture' },
  { dayOfWeek: 2, subject: 'Microcontroller & Sensors Lab', code: 'CS402L', startTime: '13:00', endTime: '15:00', classroom: 'Hardware Lab 2', teacher: 'Prof. Vanshiii G.', type: 'lab' },

  // Wednesday
  { dayOfWeek: 3, subject: 'Computer Organization', code: 'CS403', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { dayOfWeek: 3, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { dayOfWeek: 3, subject: 'Project Based Learning', code: 'CS407', startTime: '11:15', endTime: '13:15', classroom: 'Project Hub', teacher: 'Prof. S. Mehta', type: 'lab' },
  { dayOfWeek: 3, subject: 'Aptitude & Reasoning', code: 'GS401', startTime: '14:00', endTime: '15:00', classroom: 'Auditorium B', teacher: 'Guest Mentor', type: 'tutorial' },

  // Thursday
  { dayOfWeek: 4, subject: 'Microcontroller & Sensors', code: 'CS402', startTime: '09:00', endTime: '10:00', classroom: 'CL-102', teacher: 'Prof. Vanshiii G.', type: 'lecture' },
  { dayOfWeek: 4, subject: 'Discrete Mathematics & Graph Theory', code: 'CS404', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Prof. Alok Verma', type: 'lecture' },
  { dayOfWeek: 4, subject: 'Machine Learning Fundamentals', code: 'CS405', startTime: '11:15', endTime: '12:15', classroom: 'CL-103', teacher: 'Dr. Priya Nair', type: 'lecture' },
  { dayOfWeek: 4, subject: 'Group Discussion & Soft Skills', code: 'GS402', startTime: '13:00', endTime: '14:00', classroom: 'Seminar Hall 1', teacher: 'Dr. Ananya Roy', type: 'tutorial' },

  // Friday
  { dayOfWeek: 5, subject: 'Introduction to Cyber Security', code: 'CS406', startTime: '09:00', endTime: '10:00', classroom: 'CL-101', teacher: 'Prof. Vikram Rao', type: 'lecture' },
  { dayOfWeek: 5, subject: 'Computer Organization', code: 'CS403', startTime: '10:00', endTime: '11:00', classroom: 'CL-101', teacher: 'Dr. Neha Kulkarni', type: 'lecture' },
  { dayOfWeek: 5, subject: 'Design Analysis & Algorithms', code: 'CS401', startTime: '11:15', endTime: '12:15', classroom: 'CL-101', teacher: 'Dr. Rajiv Sen', type: 'lecture' },
  { dayOfWeek: 5, subject: 'Mentor Mentee Session', code: 'GS403', startTime: '14:00', endTime: '15:00', classroom: 'Faculty Lounge 3', teacher: 'Assigned Mentor', type: 'tutorial' },

  // Saturday
  { dayOfWeek: 6, subject: 'SEC Technical Seminar', code: 'CS408', startTime: '09:30', endTime: '11:30', classroom: 'Lab 10', teacher: 'Tech Lead', type: 'lecture' },
  { dayOfWeek: 6, subject: 'Flexi Credit Workshop', code: 'FC401', startTime: '12:00', endTime: '14:00', classroom: 'Online / Lab 3', teacher: 'Industry Expert', type: 'tutorial' }
];

export async function getTimetable(req, res) {
  const student = req.student;
  const day = req.query.day ? parseInt(req.query.day, 10) : null;

  const query = {
    department: student.department,
    section: student.section,
    semester: student.semester
  };

  if (day && day >= 1 && day <= 6) {
    query.dayOfWeek = day;
  }

  let entries = await Timetable.find(query).sort({ dayOfWeek: 1, startTime: 1 });

  // If no database entries are found for this student's class, return the fallback curriculum schedule
  if (entries.length === 0) {
    let filtered = DEFAULT_SCHEDULE;
    if (day && day >= 1 && day <= 6) {
      filtered = filtered.filter(item => item.dayOfWeek === day);
    }
    entries = filtered.map((item, index) => ({
      id: `default-${index}`,
      department: student.department,
      section: student.section,
      semester: student.semester,
      ...item
    }));
  }

  res.json({
    section: student.section,
    department: student.department,
    semester: student.semester,
    timetable: entries
  });
}

export async function createTimetableEntry(req, res) {
  const entry = await Timetable.create(req.body);
  res.status(201).json({ entry });
}
