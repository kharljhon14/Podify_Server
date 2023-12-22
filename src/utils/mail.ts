import nodemailer from 'nodemailer';
import path from 'path';
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_EMAIL,
} from '@/utils/variables';

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
}

export async function sendVerificationEmail(profile: Profile, token: string) {
  const transport = generateEmailTransporter();

  const welcomeMsg = `Hi ${profile.name} welcome to Podify. Use the given OTP to verify your email`;
  transport.sendMail({
    to: profile.email,
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

interface Options {
  email: string;
  link: string;
}

export async function sendForgotPasswordEmail(options: Options) {
  const transport = generateEmailTransporter();

  const message = `We just received a request that you forgot your password. No problem you can use the link below and create brand new password.`;
  transport.sendMail({
    to: options.email,
    from: VERIFICATION_EMAIL,
    subject: 'Reset Password',
    html: generateTemplate({
      title: 'Forgot Password',
      message: message,
      logo: 'cid:logo',
      banner: 'cid:forget_password',
      link: options.link,
      btnTitle: 'Reset Password',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../templates/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'forget_password.png',
        path: path.join(__dirname, '../templates/forget_password.png'),
        cid: 'forget_password',
      },
    ],
  });
}

export async function sendForgotPasswordSuccessEmail(name: string, email: string) {
  const transport = generateEmailTransporter();

  const message = `Dear ${name} we just updated your new password. You can now sign in with your new password.`;
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Password Updated Successfully',
    html: generateTemplate({
      title: 'Password Updated Successfully',
      message: message,
      logo: 'cid:logo',
      banner: 'cid:forget_password',
      link: SIGN_IN_URL,
      btnTitle: 'Sign in',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../templates/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'forget_password.png',
        path: path.join(__dirname, '../templates/forget_password.png'),
        cid: 'forget_password',
      },
    ],
  });
}
