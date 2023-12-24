import {
  create,
  generateForgotPasswordLink,
  grantValid,
  reVerifyEmail,
  signIn,
  updatePassword,
  verifyEmail,
} from '@/controllers/user';
import { isValidForgotPasswordToken, mustAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import User from '@/models/user';
import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndUserIdSchema,
  UpdatePasswordSchema,
} from '@/utils/validationSchema';

import { RequestHandler, Router } from 'express';

const router = Router();

//Create new user
router.post('/create', validate(CreateUserSchema), create);
router.post('/verify-email', validate(TokenAndUserIdSchema), verifyEmail);
router.post('/re-verify-email', reVerifyEmail);

//Update user password
router.post('/forgot-password', generateForgotPasswordLink);
router.post(
  '/verify-forgot-password-token',
  validate(TokenAndUserIdSchema),
  isValidForgotPasswordToken,
  grantValid
);
router.post(
  '/update-password',
  validate(UpdatePasswordSchema),
  isValidForgotPasswordToken,
  updatePassword as RequestHandler
);

//Sign in user
router.post('/sign-in', validate(SignInValidationSchema), signIn);
router.post('/is-auth', mustAuth, (req, res) => {
  res.json({
    profile: req.user,
  });
});

//Authentication
router.post('/public', (_req, res) => {
  res.json({
    message: 'Your are in public route',
  });
});
router.post('/private', mustAuth, (_req, res) => {
  res.json({
    message: 'Your are in private route',
  });
});

export default router;
