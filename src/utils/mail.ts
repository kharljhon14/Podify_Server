import nodemailer from 'nodemailer';
import path from 'path';
import { MAILTRAP_PASSWORD, MAILTRAP_USER, VERIFICATION_EMAIL } from '@/utils/variables';

import EmailVerificationToken from '@/models/emailVerificationToken';
import { generateTemplate } from '@/templates/template';

export function generateEmailTransporter() {
  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });
}

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export async function sendVerificationEmail({ name, email, userId }: Profile, token: string) {
  const transport = generateEmailTransporter();

  const welcomeMsg = `Hi ${name} welcome to Podify. Use the given OTP to verify your email`;
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
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
}
