import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { storage } from '../storage';

// Configure OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/auth/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not set. Authentication will not work properly.');
}

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

export const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export function generateAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

export async function handleGoogleCallback(code: string) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Get user info
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: tokens.id_token as string,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Failed to get user information from Google');
  }

  // Check if user exists
  let user = await storage.getUserByEmail(payload.email);

  if (user) {
    // Update tokens
    user = await storage.updateUserTokens(
      user.id,
      tokens.access_token as string,
      tokens.refresh_token as string,
      new Date(Date.now() + (tokens.expiry_date || 3600 * 1000))
    ) || user;
  } else {
    // Create new user
    user = await storage.createUser({
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture || '',
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      tokenExpiry: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
    });
  }

  return user;
}

export function getAuthClientForUser(accessToken: string, refreshToken?: string) {
  const client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return client;
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
