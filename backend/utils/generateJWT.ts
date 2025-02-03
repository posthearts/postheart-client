import jwt from 'jsonwebtoken';

export const generateJWT = (user: { _id: string }): string => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};