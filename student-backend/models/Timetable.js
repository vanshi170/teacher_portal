import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  department: { type: String, required: true, trim: true, maxlength: 100 },
  section: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
  semester: { type: Number, required: true, min: 1, max: 12 },
  dayOfWeek: { type: Number, required: true, min: 1, max: 6 }, // 1 = Mon, 6 = Sat
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  code: { type: String, trim: true, maxlength: 20, default: '' },
  startTime: { type: String, required: true, trim: true, maxlength: 10 }, // e.g. "09:00"
  endTime: { type: String, required: true, trim: true, maxlength: 10 },   // e.g. "10:00"
  classroom: { type: String, required: true, trim: true, maxlength: 50 }, // e.g. "CL-101", "Lab 10"
  teacher: { type: String, trim: true, maxlength: 100, default: 'Faculty' },
  type: { type: String, enum: ['lecture', 'lab', 'tutorial'], default: 'lecture' }
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

timetableSchema.index({ department: 1, section: 1, semester: 1, dayOfWeek: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
