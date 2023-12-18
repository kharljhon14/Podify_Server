import { Response } from 'express';

import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { generateToken } from '@/utils/helper';
import { sendVerificationEmail } from '@/utils/mail';

export async function create(req: CreateUser, res: Response) {
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
