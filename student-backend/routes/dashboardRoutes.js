import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { requireStudent } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/', requireStudent, asyncHandler(getDashboard));

export default router;
