import { validate } from '@/middlewares/validator';
import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', validate(CreateUserSchema), async (req: CreateUser, res) => {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  //   const newUser = new User({ email, password, name });
  //   newUser.save();

  const newUser = await User.create({
    name,
    email,
    password,
  });

  res.json({ status: 201, data: { newUser } });
});

export default router;
