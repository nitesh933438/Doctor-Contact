import express from 'express';
import { registerUser, loginUser, getGoogleAuthUrl, handleGoogleCallback } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);
router.get('/google/callback/', handleGoogleCallback); // Handle trailing slash

export default router;
