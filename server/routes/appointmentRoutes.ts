import express from 'express';
import { createAppointment, getUserAppointments, updateAppointmentStatus, getBookedSlots } from '../controllers/appointmentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/my', protect, getUserAppointments);
router.get('/booked/:doctorId', getBookedSlots);
router.put('/:id', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;
