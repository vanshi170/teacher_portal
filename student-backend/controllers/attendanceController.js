import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';
import ApiError from '../utils/ApiError.js';
import { createQrToken, hashQrToken } from '../utils/qrToken.js';

export async function createSession(req, res) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + req.body.expiresInMinutes * 60_000);
  const lateAfter = new Date(now.getTime() + req.body.lateAfterMinutes * 60_000);
  const { token, tokenHash } = createQrToken();
  const session = await AttendanceSession.create({
    ...req.body,
    startsAt: now,
    expiresAt,
    lateAfter,
    tokenHash
  });

  res.status(201).json({
    session,
    qrToken: token
  });
}

export async function closeSession(req, res) {
  const session = await AttendanceSession.findById(req.params.sessionId);
  if (!session) {
    throw new ApiError(404, 'Attendance session not found.');
  }
  session.active = false;
  await session.save();
  res.json({ session });
}

export async function markAttendance(req, res) {
  const session = await AttendanceSession.findOne({ tokenHash: hashQrToken(req.body.qrToken) });
  const now = new Date();

  if (!session || !session.active || session.startsAt > now || session.expiresAt <= now) {
    throw new ApiError(400, 'This attendance QR token is invalid, expired, or inactive.');
  }

  const student = req.student;
  if (
    student.department.toLowerCase() !== session.department.toLowerCase()
    || student.section.toUpperCase() !== session.section.toUpperCase()
    || student.semester !== session.semester
  ) {
    throw new ApiError(403, 'This attendance session is not for your class.');
  }

  const status = now > session.lateAfter ? 'late' : 'present';
  let attendance;
  try {
    attendance = await Attendance.create({ student: student.id, session: session.id, status, markedAt: now });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Attendance has already been marked for this session.');
    }
    throw error;
  }

  res.status(201).json({
    status: attendance.status,
    markedAt: attendance.markedAt,
    subject: session.subject,
    sessionId: session.id
  });
}

export async function getHistory(req, res) {
  const { from, to, subject, limit } = req.validatedQuery;
  const sessionFilter = {
    department: req.student.department,
    section: req.student.section,
    semester: req.student.semester
  };
  if (from || to) {
    sessionFilter.startsAt = {};
    if (from) sessionFilter.startsAt.$gte = new Date(from);
    if (to) sessionFilter.startsAt.$lte = new Date(to);
  }
  if (subject) {
    sessionFilter.subject = { $regex: `^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
  }

  const sessions = await AttendanceSession.find(sessionFilter).sort({ startsAt: -1 }).limit(limit);
  const records = await Attendance.find({
    student: req.student.id,
    session: { $in: sessions.map((session) => session.id) }
  });
  const bySession = new Map(records.map((record) => [record.session.toString(), record]));
  const now = new Date();
  const history = sessions
    .filter((session) => !session.active || session.expiresAt <= now || bySession.has(session.id))
    .map((session) => {
      const record = bySession.get(session.id);
      return {
        sessionId: session.id,
        subject: session.subject,
        date: session.startsAt,
        status: record?.status || 'absent',
        markedAt: record?.markedAt || null
      };
    });

  res.json({ history });
}
