import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';

export async function getDashboard(req, res) {
  const student = req.student;
  const sessions = await AttendanceSession.find({
    department: student.department,
    section: student.section,
    semester: student.semester
  }).sort({ startsAt: -1 });
  const records = await Attendance.find({
    student: student.id,
    session: { $in: sessions.map((session) => session.id) }
  });
  const recordsBySession = new Map(records.map((record) => [record.session.toString(), record]));
  const now = new Date();
  const reportableSessions = sessions.filter((session) => (
    !session.active || session.expiresAt <= now || recordsBySession.has(session.id)
  ));

  const subjects = new Map();
  for (const session of reportableSessions) {
    const stats = subjects.get(session.subject) || {
      subject: session.subject,
      totalClasses: 0,
      attendedClasses: 0,
      absentClasses: 0,
      lateClasses: 0
    };
    stats.totalClasses += 1;
    const record = recordsBySession.get(session.id);
    if (record) {
      stats.attendedClasses += 1;
      if (record.status === 'late') stats.lateClasses += 1;
    } else {
      stats.absentClasses += 1;
    }
    subjects.set(session.subject, stats);
  }

  const totalClasses = reportableSessions.length;
  const attendedClasses = reportableSessions.filter((session) => recordsBySession.has(session.id)).length;
  res.json({
    totalClasses,
    attendedClasses,
    absentClasses: totalClasses - attendedClasses,
    attendancePercentage: totalClasses ? Number(((attendedClasses / totalClasses) * 100).toFixed(2)) : 0,
    subjects: [...subjects.values()].map((stats) => ({
      ...stats,
      attendancePercentage: stats.totalClasses
        ? Number(((stats.attendedClasses / stats.totalClasses) * 100).toFixed(2))
        : 0
    }))
  });
}
