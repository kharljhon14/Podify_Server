import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { Router } from 'express';

const router = Router();

router.post('/create', async (req: CreateUser, res) => {
  const { email, password, name } = req.body;
  //   const newUser = new User({ email, password, name });
  //   newUser.save();

  const newUser = await User.create({
    name,
    email,
    password,
  });

  res.json({ status: res.status, data: { newUser } });
});

export default router;
