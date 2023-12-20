import { NextFunction, Response } from 'express';
import { VerifyForgotPasswordTokenRequest } from '@/types/user';
import PasswordResetToken from '@/models/passwordResetToken';

export async function isValidForgotPasswordToken(
  req: VerifyForgotPasswordTokenRequest,
  res: Response,
  next: NextFunction
) {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({ owner: userId });

  if (!resetToken) return res.status(403).json({ error: 'Unauthorized access, invalid token' });

  const matched = await resetToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: 'Unauthorized access, invalid token' });

  next();
}
