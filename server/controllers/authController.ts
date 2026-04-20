import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const getRedirectUri = (req: Request) => {
  return `${process.env.APP_URL || `http://${req.headers.host}`}/api/auth/google/callback`;
};

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const redirectUri = getRedirectUri(req);
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    redirectUri
  );

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    prompt: 'consent'
  });

  res.json({ url: authUrl });
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  const redirectUri = getRedirectUri(req);
  
  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      redirectUri
    );

    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('No email found in Google payload');
    }

    const { email, name } = payload;
    
    let user: any = await User.findOne({ email });

    if (!user) {
      // Create new user, since password is required, generate a random one
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({ 
        name: name || 'Google User', 
        email, 
        password: randomPassword, 
        role: 'patient' 
      });
    }

    const outputData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    };

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', payload: ${JSON.stringify(outputData)} }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', message: 'Failed to authenticate with Google' }, '*');
              window.close();
            }
          </script>
          <p>Authentication failed. Please try again.</p>
        </body>
      </html>
    `);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: any = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
