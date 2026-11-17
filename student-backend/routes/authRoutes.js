import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, register } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { loginSchema, registerSchema } from '../utils/validation.js';

const router = Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' }
});

router.post('/register', authRateLimit, validateBody(registerSchema), asyncHandler(register));
router.post('/login', authRateLimit, validateBody(loginSchema), asyncHandler(login));

export default router;
