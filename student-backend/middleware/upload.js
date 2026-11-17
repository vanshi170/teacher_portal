import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new ApiError(400, 'Only JPG, PNG and WebP images are allowed.')
      );
    }

    callback(null, true);
  }
});

export const uploadProfilePhoto = upload.single('photo');
