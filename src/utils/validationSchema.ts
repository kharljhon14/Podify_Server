import { isValidObjectId } from 'mongoose';
import { object, string } from 'yup';

export const CreateUserSchema = object().shape({
  name: string().trim().required('Name is required').max(40, 'Name is too long!'),
  email: string().required('Email is required').email('Invalid email'),
  password: string()
    .trim()
    .required('Password is required')
    .min(8, 'Password should at least 8 characters')
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
      'Password should contain special and numerical charaters '
    ),
});

export const TokenAndUserIdSchema = object().shape({
  token: string().trim().required('Invalid token'),
  userId: string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;

      return '';
    })
    .required('Invalid user id'),
});

export const UpdatePasswordSchema = object().shape({
  password: string()
    .trim()
    .required('Password is required')
    .min(8, 'Password should at least 8 characters')
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
      'Password should contain special and numerical charaters '
    ),
});
