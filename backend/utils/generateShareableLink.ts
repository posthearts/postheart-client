import crypto from 'crypto';

const generateShareableLink = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export default generateShareableLink;