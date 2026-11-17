import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-tests';
process.env.ADMIN_API_KEY = 'test-admin-key-that-is-long-enough-for-tests';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

const [{ default: app }, { default: Student }, { default: Attendance }, { default: AttendanceSession }] =
  await Promise.all([
    import('../app.js'),
    import('../models/Student.js'),
    import('../models/Attendance.js'),
    import('../models/AttendanceSession.js')
  ]);

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await Promise.all([
    Student.deleteMany({}),
    Attendance.deleteMany({}),
    AttendanceSession.deleteMany({})
  ]);
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('returns the student API health response', async () => {
  const response = await request(app)
    .get('/health')
    .expect('Content-Type', /json/)
    .expect(200);

  assert.deepEqual(response.body, {
    success: true,
    message: 'Student Attendance API is running'
  });
});

test('registers a student, authenticates ownership, and marks one QR attendance only once', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'A Student',
    prn: 'CS001',
    email: 'student@example.test',
    password: 'strong-password-123',
    department: 'Computer Science',
    section: 'A',
    semester: 4
  }).expect(201);

  assert.equal(registration.body.student.prn, 'CS001');
  assert.equal('passwordHash' in registration.body.student, false);

  const login = await request(app).post('/api/auth/login').send({
    prn: 'cs001',
    password: 'strong-password-123'
  }).expect(200);
  const authorization = ['Bearer', login.body.token].join(' ');

  await request(app).get('/api/profile').expect(401);
  const profile = await request(app).get('/api/profile').set('Authorization', authorization).expect(200);
  assert.equal(profile.body.student.email, 'student@example.test');
  const nonStudentToken = jwt.sign(
    { sub: registration.body.student.id, role: 'teacher' },
    process.env.JWT_SECRET
  );
  await request(app)
    .get('/api/profile')
    .set('Authorization', ['Bearer', nonStudentToken].join(' '))
    .expect(401);
  const updatedProfile = await request(app)
    .patch('/api/profile')
    .set('Authorization', authorization)
    .send({ name: 'Updated Student', profilePhoto: 'https://example.test/student.png' })
    .expect(200);
  assert.equal(updatedProfile.body.student.name, 'Updated Student');
  assert.equal(updatedProfile.body.student.profilePhoto, 'https://example.test/student.png');
  await request(app)
    .patch('/api/profile')
    .set('Authorization', authorization)
    .send({ department: 'Other Department' })
    .expect(400);

  const createdSession = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Algorithms',
      department: 'Computer Science',
      section: 'A',
      semester: 4,
      expiresInMinutes: 10,
      lateAfterMinutes: 10
    })
    .expect(201);
  const qrToken = createdSession.body.qrToken;

  await request(app).post('/api/attendance/scan').send({ qrToken }).expect(401);
  const marked = await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken, prn: 'SOMEONE-ELSE', name: 'Spoofed Name' })
    .expect(201);
  assert.equal(marked.body.status, 'present');
  const savedAttendance = await Attendance.findOne({ session: createdSession.body.session.id });
  assert.equal(savedAttendance.student.toString(), registration.body.student.id);

  await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken })
    .expect(409);

  const dashboard = await request(app)
    .get('/api/dashboard')
    .set('Authorization', authorization)
    .expect(200);
  assert.deepEqual(
    {
      totalClasses: dashboard.body.totalClasses,
      attendedClasses: dashboard.body.attendedClasses,
      absentClasses: dashboard.body.absentClasses,
      attendancePercentage: dashboard.body.attendancePercentage
    },
    { totalClasses: 1, attendedClasses: 1, absentClasses: 0, attendancePercentage: 100 }
  );
});

test('does not count an unmarked active session as absent before it is closed', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'Another Student',
    prn: 'CS002',
    email: 'another-student@example.test',
    password: 'strong-password-123',
    department: 'Computer Science',
    section: 'A',
    semester: 4
  }).expect(201);
  const authorization = ['Bearer', registration.body.token].join(' ');
  const session = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Databases',
      department: 'Computer Science',
      section: 'A',
      semester: 4
    })
    .expect(201);

  const activeDashboard = await request(app)
    .get('/api/dashboard')
    .set('Authorization', authorization)
    .expect(200);
  assert.equal(activeDashboard.body.totalClasses, 0);
  assert.deepEqual(activeDashboard.body.subjects, []);

  const activeHistory = await request(app)
    .get('/api/attendance/history')
    .set('Authorization', authorization)
    .expect(200);
  assert.deepEqual(activeHistory.body.history, []);

  await request(app)
    .patch(`/api/attendance/sessions/${session.body.session.id}/close`)
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .expect(200);

  const closedDashboard = await request(app)
    .get('/api/dashboard')
    .set('Authorization', authorization)
    .expect(200);
  assert.deepEqual(
    {
      totalClasses: closedDashboard.body.totalClasses,
      attendedClasses: closedDashboard.body.attendedClasses,
      absentClasses: closedDashboard.body.absentClasses,
      attendancePercentage: closedDashboard.body.attendancePercentage
    },
    { totalClasses: 1, attendedClasses: 0, absentClasses: 1, attendancePercentage: 0 }
  );

  const closedHistory = await request(app)
    .get('/api/attendance/history')
    .set('Authorization', authorization)
    .expect(200);
  assert.equal(closedHistory.body.history[0].status, 'absent');
});

test('rejects invalid session timing and requires the admin key for session creation', async () => {
  await request(app)
    .post('/api/attendance/sessions')
    .send({
      subject: 'Algorithms',
      department: 'Computer Science',
      section: 'A',
      semester: 4
    })
    .expect(401);

  await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Algorithms',
      department: 'Computer Science',
      section: 'A',
      semester: 4,
      expiresInMinutes: 5,
      lateAfterMinutes: 6
    })
    .expect(400);
});

test('rejects invalid, expired, inactive, and out-of-scope QR sessions', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'Scope Student',
    prn: 'CS003',
    email: 'scope-student@example.test',
    password: 'strong-password-123',
    department: 'Computer Science',
    section: 'A',
    semester: 4
  }).expect(201);
  const authorization = ['Bearer', registration.body.token].join(' ');

  await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken: 'invalid-qr-token-value-that-is-long-enough' })
    .expect(400);

  const expiredSession = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Algorithms',
      department: 'Computer Science',
      section: 'A',
      semester: 4
    })
    .expect(201);
  await AttendanceSession.findByIdAndUpdate(expiredSession.body.session.id, {
    expiresAt: new Date(Date.now() - 1000)
  });
  await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken: expiredSession.body.qrToken })
    .expect(400);

  const inactiveSession = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Databases',
      department: 'Computer Science',
      section: 'A',
      semester: 4
    })
    .expect(201);
  await request(app)
    .patch(`/api/attendance/sessions/${inactiveSession.body.session.id}/close`)
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .expect(200);
  await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken: inactiveSession.body.qrToken })
    .expect(400);

  const outOfScopeSession = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Networks',
      department: 'Computer Science',
      section: 'B',
      semester: 4
    })
    .expect(201);
  await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken: outOfScopeSession.body.qrToken })
    .expect(403);
});

test('reports late check-ins in attendance history and subject statistics', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'Late Student',
    prn: 'CS004',
    email: 'late-student@example.test',
    password: 'strong-password-123',
    department: 'Computer Science',
    section: 'A',
    semester: 4
  }).expect(201);
  const authorization = ['Bearer', registration.body.token].join(' ');
  const session = await request(app)
    .post('/api/attendance/sessions')
    .set('x-admin-key', process.env.ADMIN_API_KEY)
    .send({
      subject: 'Operating Systems',
      department: 'Computer Science',
      section: 'A',
      semester: 4,
      lateAfterMinutes: 0
    })
    .expect(201);

  const marked = await request(app)
    .post('/api/attendance/scan')
    .set('Authorization', authorization)
    .send({ qrToken: session.body.qrToken })
    .expect(201);
  assert.equal(marked.body.status, 'late');

  const history = await request(app)
    .get('/api/attendance/history')
    .set('Authorization', authorization)
    .expect(200);
  assert.equal(history.body.history[0].status, 'late');

  const dashboard = await request(app)
    .get('/api/dashboard')
    .set('Authorization', authorization)
    .expect(200);
  assert.equal(dashboard.body.subjects[0].lateClasses, 1);
  assert.equal(dashboard.body.subjects[0].attendancePercentage, 100);
});

test('retrieves student timetable matching section and day filter', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'Timetable Test Student',
    prn: 'TT101',
    email: 'tt101@example.test',
    password: 'strong-password-123',
    department: 'Computer Science',
    section: 'A',
    semester: 4
  });
  const token = registration.body.token;

  const res = await request(app)
    .get('/api/timetable?day=1')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(res.body.section, 'A');
  assert.ok(Array.isArray(res.body.timetable));
  assert.ok(res.body.timetable.length > 0);
  assert.equal(res.body.timetable[0].dayOfWeek, 1);
});

