import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  fees: { type: Number, required: true },
  availableSlots: [{ 
    day: String,
    time: [String]
  }],
}, { timestamps: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
