import { Request, Response } from 'express';

import User from '@/models/user';
import {
  CreateUserRequest,
  GenerateForgotPasswordLinkRequest,
  ReVerifyEmailRequest,
  UpdatePasswordRequest,
  VerifyEmailRequest,
} from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { formatProfile, generateToken } from '@/utils/helper';
import {
  sendForgotPasswordEmail,
  sendForgotPasswordSuccessEmail,
  sendVerificationEmail,
} from '@/utils/mail';
import EmailVerificationToken from '@/models/emailVerificationToken';
import { isValidObjectId } from 'mongoose';
import PasswordResetToken from '@/models/passwordResetToken';
import crypto from 'crypto';
import { JWT_SECRET, PASSWORD_RESET_LINK } from '@/utils/variables';
import jwt from 'jsonwebtoken';
import { RequestWithFiles } from '@/middlewares/fileParser';
import cloudinary from '@/cloud';

export async function create(req: CreateUserRequest, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

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

  sendVerificationEmail({ name, email }, token);

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

export async function reVerifyEmail(req: ReVerifyEmailRequest, res: Response) {
  const { userId } = req.body;

  if (!isValidObjectId(userId)) return res.status(403).json({ error: 'Invalid request!' });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: 'Invalid request!' });

  await EmailVerificationToken.findOneAndDelete({ owner: userId });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationEmail({ name: user.name, email: user.email }, token);

  res.json({ message: 'Please check your email' });
}

export async function generateForgotPasswordLink(
  req: GenerateForgotPasswordLinkRequest,
  res: Response
) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Account not found' });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = crypto.randomBytes(36).toString('hex');

  await PasswordResetToken.create({
    owner: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordEmail({ email, link: resetLink });

  res.json({ message: 'Check your email' });
}

export function grantValid(_req: Request, res: Response) {
  res.json({ valid: true });
}

export async function updatePassword(req: UpdatePasswordRequest, res: Response) {
  const { password, userId } = req.body;

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: ' Unauthorized access!' });

  const matched = await user.comparePassword(password);

  if (matched)
    return res.status(422).json({ error: 'Password must be different from old password!' });

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  sendForgotPasswordSuccessEmail(user.name, user.email);
  res.json({ message: 'Password update successfully' });
}

export async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;

  //Look for existing user
  const user = await User.findOne({
    email,
  });

  if (!user) return res.status(403).json({ error: 'Email or password is incorrect' });

  const matched = await user.comparePassword(password);

  //Compare the password
  if (!matched) return res.status(403).json({ error: 'Email or password is incorrect' });

  //Generate token

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
  user.tokens.push(token);

  await user.save();

  res.json({
    profile: req.user,
    token,
  });
}

export async function updateProfile(req: RequestWithFiles, res: Response) {
  const { name } = req.body;

  const avatar = req.files?.avatar;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error('Something went wrong, user not found!');

  if (typeof name !== 'string') return res.status(422).json({ error: 'Invalid name' });

  if (name.trim().length < 3) return res.status(422).json({ error: 'Invalid name' });

  user.name = name;

  if (avatar) {
    // if there is  already an avatar file, we want to remove that

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    //upload new avatar file
    const { secure_url, public_id } = await cloudinary.uploader.upload(avatar.filepath, {
      width: 300,
      height: 300,
      crop: 'thumb',
      gravity: 'face',
    });

    user.avatar = {
      url: secure_url,
      publicId: public_id,
    };
  }

  await user.save();

  res.json({ profile: formatProfile(user) });
}

export async function sendProfile(req: Request, res: Response) {
  res.json({ profile: req.user });
}

export async function signOut(req: Request, res: Response) {
  const { fromAll } = req.query;

  const { token } = req;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error('Something went wrong, user not found!');

  //sign out from all

  if (fromAll === 'yes') user.tokens = [];
  else user.tokens = user.tokens.filter((t) => t !== token);

  await user.save();

  res.json({ success: true });
}
