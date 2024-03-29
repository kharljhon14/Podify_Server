import { isValidObjectId } from 'mongoose';
import { object, string } from 'yup';
import { categories } from './audioCategories';

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

export const SignInValidationSchema = object().shape({
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

export const AudioValidationScehma = object().shape({
  title: string().required('Title is missing'),
  about: string().required('About is missing'),
  category: string().oneOf(categories, 'Invalid category').required('Category is missing'),
});

export const NewPlaylistValidationScehma = object().shape({
  title: string().required('Title is missing'),
  audioId: string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),
  visibility: string()
    .oneOf(['public', 'private'], 'Invalid visibility')
    .required('visibility is missing'),
});

export const UpdatePlaylistValidationScehma = object().shape({
  //Playlist id validation
  id: string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),
  title: string().required('Title is missing'),
  item: string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),

  visibility: string()
    .oneOf(['public', 'private'], 'Invalid visibility')
    .required('visibility is missing'),
});
