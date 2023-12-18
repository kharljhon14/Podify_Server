import { create, reVerifyEmail, verifyEmail } from '@/controllers/user';
import { validate } from '@/middlewares/validator';
import { CreateUserSchema, EmailVerificationSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);
router.post('/verify-email', validate(EmailVerificationSchema), verifyEmail);
router.post('/re-verify-email', reVerifyEmail);

export default router;
