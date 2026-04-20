import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { lockedSlots } from '../../server';

interface AuthRequest extends Request {
  user?: any;
}

export const getBookedSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const date = req.query.date as string;

    if (!date) return res.status(400).json({ message: 'Date is required' });

    // Find existing booked appointments (not cancelled)
    const appointments = await Appointment.find({ 
      doctorId, 
      date, 
      status: { $ne: 'cancelled' } 
    }).select('time');

    const bookedTimes = appointments.map(a => a.time);
    res.json(bookedTimes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  const { doctorId, date, time } = req.body;
  try {
    // Check if slot is already booked in DB
    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time
    });

    // Remove lock from memory and emit unlock or booked event
    const slotKey = `${doctorId}_${date}_${time}`;
    if (lockedSlots.has(slotKey)) {
      lockedSlots.delete(slotKey);
    }
    
    // Broadcast via global io if possible
    const io = req.app.get('io');
    if (io) {
      io.emit('slot_booked', { slotKey });
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patientId: req.user._id } 
      : { doctorId: req.user._id }; // Simplified, ideally doctorId links to Doctor model
    const appointments = await Appointment.find(query).populate('patientId', 'name email').populate('doctorId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    appointment.status = req.body.status || appointment.status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
