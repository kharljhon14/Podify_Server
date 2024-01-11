import Audio from '@/models/audio';
import Favorite from '@/models/favorite';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

export async function toggleFavorite(req: Request, res: Response) {
  const audioId = req.query.audioId as string;
  let status: 'added' | 'removed';

  if (!isValidObjectId(audioId)) return res.status(422).json({ error: 'Audio id is invalid!' });

  const audio = await Audio.findById(audioId);

  if (!audio) return res.status(404).json({ error: 'Resources not found!' });

  const alreadyExist = await Favorite.findOne({ owner: req.user.id, items: audioId });

  if (alreadyExist) {
    await Favorite.updateOne({ owner: req.user.id }, { $pull: { items: audioId } });
    status = 'removed';
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });

    if (favorite) {
      await Favorite.updateOne({ owner: req.user.id }, { $addToSet: { items: audioId } });
    } else {
      await Favorite.create({ owner: req.user.id, items: [audioId] });
    }

    status = 'added';
  }

  if (status === 'added') {
    await Audio.findByIdAndUpdate(audioId, { $addToSet: { likes: req.user.id } });
  } else if (status === 'removed') {
    await Audio.findByIdAndUpdate(audioId, { $pull: { likes: req.user.id } });
  }

  res.json({ status });
}
