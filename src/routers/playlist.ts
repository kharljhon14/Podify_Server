import {
  createPlaylist,
  getPlaylistByProfile,
  removePlaylist,
  updatePlaylist,
} from '@/controllers/playlist';
import { isVerified, mustAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validator';
import {
  NewPlaylistValidationScehma,
  UpdatePlaylistValidationScehma,
} from '@/utils/validationSchema';
import { Router } from 'express';

const router = Router();

router.post('/create', mustAuth, isVerified, validate(NewPlaylistValidationScehma), createPlaylist);
router.patch('/', mustAuth, validate(UpdatePlaylistValidationScehma), updatePlaylist);
router.delete('/', mustAuth, removePlaylist);

router.get('/by-profile', mustAuth, getPlaylistByProfile);

export default router;
