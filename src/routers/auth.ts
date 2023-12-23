import {
  create,
  generateForgotPasswordLink,
  grantValid,
  reVerifyEmail,
  signIn,
  updatePassword,
  verifyEmail,
} from '@/controllers/user';
import { isValidForgotPasswordToken } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import User from '@/models/user';
import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndUserIdSchema,
  UpdatePasswordSchema,
} from '@/utils/validationSchema';
import { JWT_SECRET } from '@/utils/variables';
import { Request, RequestHandler, Response, Router } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

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
router.post('/is-auth', async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;
    const token = authorization?.split('Bearer ')[1];

    if (!token) return res.status(403).json({ error: 'Unauthorized request' });

    const payload = verify(token, JWT_SECRET) as JwtPayload;

    const { userId } = payload;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // If everything is successful, send a success response
    res.json({ ok: true });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
