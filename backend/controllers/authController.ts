import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface User {
  name: string;
  profile_picture: string;
  // Add other properties if needed
}

const generateJWT = (user: any): string => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

export const googleAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user as User;
    const token = generateJWT(user);
    const redirectUrl = `https://postheart-client.vercel.app/auth?token=${token}&name=${encodeURIComponent(user.name)}&profile_picture=${encodeURIComponent(user.profile_picture)}`;
    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};
