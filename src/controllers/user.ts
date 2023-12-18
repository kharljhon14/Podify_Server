import { Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';

import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '@/utils/variables';
import { generateToken } from '@/utils/helper';
import EmailVerificationToken from '@/models/emailVerificationToken';
import { generateTemplate } from '@/templates/template';

export async function create(req: CreateUser, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  const user = await User.create({
    name,
    email,
    password,
  });

  const welcomeMsg = `Hi ${name} welcome to Podify. Use the given OTP to verify your email`;

  const token = generateToken();

  const newToken = await EmailVerificationToken.create({
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
    subject: 'Welcome to Podify!',
    html: generateTemplate({
      title: 'Welcome to Podify',
      message: welcomeMsg,
      logo: 'cid:logo',
      banner: 'cid:welcome',
      link: '#',
      btnTitle: token,
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../templates/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'welcome.png',
        path: path.join(__dirname, '../templates/welcome.png'),
        cid: 'welcome',
      },
    ],
  });

  res.status(201).json({ data: { newUser: user } });
}
