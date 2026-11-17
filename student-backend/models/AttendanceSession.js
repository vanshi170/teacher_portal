import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  department: { type: String, required: true, trim: true, maxlength: 100 },
  section: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
  semester: { type: Number, required: true, min: 1, max: 12 },
  startsAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  lateAfter: { type: Date, required: true },
  active: { type: Boolean, default: true },
  tokenHash: { type: String, required: true, unique: true, select: false }
}, {
  timestamps: true,
  toJSON: {
    transform(_document, value) {
      value.id = value._id.toString();
      delete value._id;
      delete value.__v;
      delete value.tokenHash;
      return value;
    }
  }
});

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
