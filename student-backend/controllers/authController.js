import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';

function publicStudent(student) {
  return {
    id: student.id,
    name: student.name,
    prn: student.prn,
    email: student.email,
    department: student.department,
    section: student.section,
    semester: student.semester,
    profilePhoto: student.profilePhoto
  };
}

function signStudentToken(student) {
  return jwt.sign({ sub: student.id, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

export async function register(req, res) {
  const student = await Student.create({
    ...req.body,
    prn: req.body.prn.toUpperCase(),
    section: req.body.section.toUpperCase(),
    passwordHash: req.body.password
  });

  res.status(201).json({
    student: publicStudent(student),
    token: signStudentToken(student)
  });
}

export async function login(req, res) {
  const prn = req.body.prn.toUpperCase();
  const student = await Student.findOne({ prn }).select('+passwordHash');
  const passwordMatches = student
    ? await student.verifyPassword(req.body.password)
    : await bcrypt.compare(req.body.password, '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5v5Y7gVv6b8A2h8F4P3U6xq7LqYQ9Xu');

  if (!student || !passwordMatches) {
    throw new ApiError(401, 'PRN or password is incorrect.');
  }

  res.json({
    student: publicStudent(student),
    token: signStudentToken(student)
  });
}
