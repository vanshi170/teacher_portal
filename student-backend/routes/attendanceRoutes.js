import { Router } from 'express';
import {
  closeSession,
  createSession,
  getHistory,
  markAttendance
} from '../controllers/attendanceController.js';
import { requireAdminKey, requireStudent } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createSessionSchema,
  historyQuerySchema,
  markAttendanceSchema
} from '../utils/validation.js';

const router = Router();
router.post('/sessions', requireAdminKey, validateBody(createSessionSchema), asyncHandler(createSession));
router.patch('/sessions/:sessionId/close', requireAdminKey, asyncHandler(closeSession));
router.post('/scan', requireStudent, validateBody(markAttendanceSchema), asyncHandler(markAttendance));
router.get('/history', requireStudent, validateQuery(historyQuerySchema), asyncHandler(getHistory));

export default router;
