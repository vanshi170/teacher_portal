import { Router } from 'express';
import { getTimetable, createTimetableEntry } from '../controllers/timetableController.js';
import { requireStudent, requireAdminKey } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', requireStudent, asyncHandler(getTimetable));
router.post('/', requireAdminKey, asyncHandler(createTimetableEntry));

export default router;
