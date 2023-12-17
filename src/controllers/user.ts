import { Response } from 'express';
import nodemailer from 'nodemailer';

import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '@/utils/variables';
import { generateToken } from '@/utils/helper';
import EmailVerificationToken from '@/models/emailVerificationToken';

export async function create(req: CreateUser, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  //   const newUser = new User({ email, password, name });
  //   newUser.save();

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  transport.sendMail({
    to: user.email,
    from: 'auth@myapp.com',
    html: `<h1>Your verification token is ${token}</h1>`,
  });

  res.status(201).json({ data: { newUser: user } });
}
