import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';

// Environment variable checks during initialization could be handled, but leaving them standard.
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.body;
    
    // Validate request
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // Fetch appointment and doctor details
    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const doctor: any = appointment.doctorId;
    if (!doctor || !doctor.fees) {
      return res.status(400).json({ message: 'Doctor fees details missing' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const amount = doctor.fees * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_order_${appointmentId}`,
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    });
  } catch (error: any) {
    console.error('Error creating razorpay order:', error);
    res.status(500).json({ message: 'Something went wrong while creating order', error: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update appointment status in the database
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'paid',
        status: 'confirmed'
      });

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }
  } catch (error: any) {
    console.error('Error verifying webhook:', error);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
};
