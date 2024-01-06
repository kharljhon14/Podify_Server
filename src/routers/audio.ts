import { createAudio } from '@/controllers/audio';
import { isVerified, mustAuth } from '@/middlewares/auth';
import { fileParser } from '@/middlewares/fileParser';
import { validate } from '@/middlewares/validator';
import { AudioValidationScehma } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post(
  '/create',
  mustAuth,
  isVerified,
  fileParser,
  validate(AudioValidationScehma),
  createAudio
);

export default router;
