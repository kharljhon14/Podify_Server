import User from '@/models/user';
import { CreateUser } from '@/types/user';
import { CreateUserSchema } from '@/utils/validationSchema';
import { Response } from 'express';

export async function create(req: CreateUser, res: Response) {
  const { email, password, name } = req.body;
  CreateUserSchema.validate({ email, password, name });

  //   const newUser = new User({ email, password, name });
  //   newUser.save();

  const newUser = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({ data: { newUser } });
}
