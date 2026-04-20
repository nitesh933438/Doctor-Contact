import { Request, Response } from 'express';
import { Doctor } from '../models/Doctor';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await doctor.deleteOne();
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
