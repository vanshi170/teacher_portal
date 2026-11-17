import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requireStudent = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'A student bearer token is required.');
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'The student token is invalid or expired.');
  }

  if (!claims.sub || claims.role !== 'student') {
    throw new ApiError(401, 'The student token is invalid.');
  }

  const student = await Student.findById(claims.sub);
  if (!student) {
    throw new ApiError(401, 'The student account no longer exists.');
  }

  req.student = student;
  next();
});

export function requireAdminKey(req, _res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.get('x-admin-key') || '';

  if (!configuredKey) {
    return next(new ApiError(503, 'Attendance session management is not configured.'));
  }

  const expected = Buffer.from(configuredKey);
  const supplied = Buffer.from(suppliedKey);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return next(new ApiError(401, 'A valid admin API key is required.'));
  }

  return next();
}
