import {
  create,
  generateForgotPasswordLink,
  grantValid,
  reVerifyEmail,
  signIn,
  updatePassword,
  updateProfile,
  verifyEmail,
} from '@/controllers/user';
import { isValidForgotPasswordToken, mustAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';

import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndUserIdSchema,
  UpdatePasswordSchema,
} from '@/utils/validationSchema';

import { RequestHandler, Router } from 'express';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { RequestWithFiles, fileParser } from '@/middlewares/fileParser';

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

//File upload
router.post('/update-profile', mustAuth, fileParser, updateProfile);

export default router;
