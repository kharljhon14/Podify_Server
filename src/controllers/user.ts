import { Response } from 'express';
import nodemailer from 'nodemailer';

import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '@/utils/variables';

export async function create(req: CreateUser, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  //   const newUser = new User({ email, password, name });
  //   newUser.save();

  const newUser = await User.create({
    name,
    email,
    password,
  });

  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  transport.sendMail({ to: newUser.email, from: 'auth@myapp.com', html: '<h1>1234</h1>' });

  res.status(201).json({ data: { newUser } });
}
