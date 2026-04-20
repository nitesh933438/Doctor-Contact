import express from 'express';
import { getDoctors, addDoctor, deleteDoctor } from '../controllers/doctorController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getDoctors);
router.post('/', protect, authorize('admin'), addDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
