import {
  create,
  generateForgotPasswordLink,
  grantValid,
  reVerifyEmail,
  verifyEmail,
} from '@/controllers/user';
import { isValidForgotPasswordToken } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import { CreateUserSchema, TokenAndUserIdSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);
router.post('/verify-email', validate(TokenAndUserIdSchema), verifyEmail);
router.post('/re-verify-email', reVerifyEmail);
router.post('/forgot-password', generateForgotPasswordLink);
router.post(
  '/verify-forgot-password-token',
  validate(TokenAndUserIdSchema),
  isValidForgotPasswordToken,
  grantValid
);

export default router;
