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
