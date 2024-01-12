import { createPlaylist } from '@/controllers/playlist';
import { isVerified, mustAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import { NewPlaylistValidationScehma } from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', mustAuth, isVerified, validate(NewPlaylistValidationScehma), createPlaylist);

export default router;
