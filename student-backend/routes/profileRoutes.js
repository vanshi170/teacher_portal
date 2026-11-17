
import { Router } from 'express';

import {
  getProfile,
  updateProfile,
  uploadProfilePhoto
} from '../controllers/profileController.js';

import { requireStudent } from '../middleware/auth.js';
import { uploadProfilePhoto as photoUpload } from '../middleware/upload.js';

import { validateBody } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

import { profileUpdateSchema } from '../utils/validation.js';

const router = Router();

router.use(requireStudent);

router.get('/', getProfile);

router.patch(
  '/',
  validateBody(profileUpdateSchema),
  asyncHandler(updateProfile)
);

router.post(
  '/photo',
  photoUpload,
  asyncHandler(uploadProfilePhoto)
);

export default router;

