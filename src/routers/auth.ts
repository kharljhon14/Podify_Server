import User from '@/models/user';
import { Router } from 'express';

const router = Router();

router.post('/create', async (req, res) => {
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
