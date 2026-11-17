import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  prn: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  department: { type: String, required: true, trim: true, maxlength: 100 },
  section: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
  semester: { type: Number, required: true, min: 1, max: 12 },

  profilePhoto: {
    type: String,
    default: '',
    trim: true,
    maxlength: 2048
  },

  profilePhotoPublicId: {
    type: String,
    default: '',
    select: false
  },

  passwordHash: { type: String, required: true, select: false }
}, {
  timestamps: true,
  toJSON: {
    transform(_document, value) {
      delete value.passwordHash;
      delete value.profilePhotoPublicId;
      delete value.__v;
      return value;
    }
  }
});

studentSchema.pre('save', async function hashPassword() {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

studentSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

const Student = mongoose.model('Student', studentSchema);

export default Student;
