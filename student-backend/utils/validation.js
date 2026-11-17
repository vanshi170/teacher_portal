import { z } from 'zod';

const cleanString = (max) => z.string().trim().min(1).max(max);
const passwordSchema = z.string().min(8).refine(
  (password) => Buffer.byteLength(password, 'utf8') <= 72,
  'Password must be 72 UTF-8 bytes or fewer.'
);
const loginPasswordSchema = z.string().min(1).refine(
  (password) => Buffer.byteLength(password, 'utf8') <= 72,
  'Password must be 72 UTF-8 bytes or fewer.'
);
const profilePhotoSchema = z.string().url().max(2048).refine(
  (photo) => /^https?:\/\//i.test(photo),
  'Profile photo must be an HTTP(S) URL.'
);

export const registerSchema = z.object({
  name: cleanString(100),
  prn: cleanString(40),
  email: z.string().trim().email().max(254),
  password: passwordSchema,
  department: cleanString(100),
  section: cleanString(10),
  semester: z.number().int().min(1).max(12),
  profilePhoto: profilePhotoSchema.optional().or(z.literal(''))
});

export const loginSchema = z.object({
  prn: cleanString(40),
  password: loginPasswordSchema
});

export const profileUpdateSchema = z.object({
  name: cleanString(100).optional(),
  email: z.string().trim().email().max(254).optional()
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  'At least one profile field is required.'
);

export const markAttendanceSchema = z.object({
  qrToken: z.string().min(32).max(256)
});

export const createSessionSchema = z.object({
  subject: cleanString(120),
  department: cleanString(100),
  section: cleanString(10),
  semester: z.number().int().min(1).max(12),
  expiresInMinutes: z.number().int().min(1).max(120).default(15),
  lateAfterMinutes: z.number().int().min(0).max(120).default(10)
}).refine((session) => session.lateAfterMinutes <= session.expiresInMinutes, {
  message: '`lateAfterMinutes` cannot exceed `expiresInMinutes`.'
});

export const historyQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  subject: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100)
}).refine((query) => !query.from || !query.to || new Date(query.from) <= new Date(query.to), {
  message: '`from` must be earlier than or equal to `to`.'
});
