import { Response } from 'express';

import User from '@/models/user';
import { CreateUserRequest, VerifyEmailRequest } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { generateToken } from '@/utils/helper';
import { sendVerificationEmail } from '@/utils/mail';
import EmailVerificationToken from '@/models/emailVerificationToken';

export async function create(req: CreateUserRequest, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken();

  sendVerificationEmail({ name, email, userId: user._id.toString() }, token);

  res.status(201).json({ data: { id: user._id, name, email } });
}

export async function verifyEmail(req: VerifyEmailRequest, res: Response) {
  const { token, userId } = req.body;

  const verificationToken = await EmailVerificationToken.findOne({ owner: userId });

  if (!verificationToken) return res.status(403).json({ error: 'Invalid token' });

  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: 'Invalid token' });

  await User.findByIdAndUpdate(userId, { verified: true });

  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: 'Your email is verified' });
}
