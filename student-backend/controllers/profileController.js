
import Student from '../models/Student.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';

export function getProfile(req, res) {
  res.json({ student: req.student });
}

export async function updateProfile(req, res) {
  const student = await Student.findByIdAndUpdate(
    req.student.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!student) {
    throw new ApiError(404, 'Student account not found.');
  }

  res.json({ student });
}

export async function uploadProfilePhoto(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'Please select a profile photo.');
  }

  const existingStudent = await Student.findById(req.student.id)
    .select('+profilePhotoPublicId');

  if (!existingStudent) {
    throw new ApiError(404, 'Student account not found.');
  }

  const oldPublicId = existingStudent.profilePhotoPublicId;

  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'student-profile-photos',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload diagnostic:', {
            name: error.name,
            message: error.message,
            http_code: error.http_code,
            provider_message: error.error?.message ?? null
          });
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(req.file.buffer);
  });

  let student;

  try {
    student = await Student.findByIdAndUpdate(
      req.student.id,
      {
        $set: {
          profilePhoto: uploaded.secure_url,
          profilePhotoPublicId: uploaded.public_id
        }
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      throw new ApiError(404, 'Student account not found.');
    }
  } catch (error) {
    await cloudinary.uploader.destroy(uploaded.public_id).catch(() => {});
    throw error;
  }

  if (oldPublicId && oldPublicId !== uploaded.public_id) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      console.error('Old profile photo cleanup failed:', error.message);
    }
  }

  res.json({
    message: 'Profile photo updated successfully.',
    student
  });
}

