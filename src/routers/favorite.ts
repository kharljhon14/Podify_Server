import { getFavorites, toggleFavorite } from '@/controllers/favorite';
import { isVerified, mustAuth } from '@/middlewares/auth';
import { Router } from 'express';

const router = Router();

router.post('/', mustAuth, isVerified, toggleFavorite);
router.get('/', mustAuth, isVerified, getFavorites);

export default router;
