import { create } from '@/controllers/user';
import { validate } from '@/middlewares/validator';
import { CreateUserSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);

export default router;
