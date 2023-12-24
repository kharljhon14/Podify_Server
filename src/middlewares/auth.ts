import { NextFunction, Request, Response } from 'express';
import { VerifyForgotPasswordTokenRequest } from '@/types/user';
import PasswordResetToken from '@/models/passwordResetToken';
import { JWT_SECRET } from '@/utils/variables';
import { JwtPayload, verify } from 'jsonwebtoken';
import User from '@/models/user';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: any;
        name: string;
        email: string;
        verified: boolean;
        avatar?: string;
        followers: number;
        followings: number;
      };
    }
  }
}

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

export async function mustAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { authorization } = req.headers;
    const token = authorization?.split('Bearer ')[1];

    if (!token) return res.status(403).json({ error: 'Unauthorized request' });

    const payload = verify(token, JWT_SECRET) as JwtPayload;

    const { userId } = payload;

    const user = await User.findOne({ _id: userId, tokens: token });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // If everything is successful, send a success response
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    };

    next();
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
