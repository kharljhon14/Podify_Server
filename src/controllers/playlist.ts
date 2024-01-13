import Audio from '@/models/audio';
import Playlist from '@/models/playlist';
import { CreatePlaylistRequest, UpdatePlaylistRequest } from '@/types/audio';
import { error } from 'console';
import { Response } from 'express';

export async function createPlaylist(req: CreatePlaylistRequest, res: Response) {
  const { title, audioId, visibility } = req.body;
  const { id } = req.user;

  if (audioId) {
    const audio = await Audio.findById(audioId);

    if (!audio) return res.status(404).json({ error: 'Could not find the audio' });
  }

  const newPlaylist = new Playlist({
    title,
    owner: id,
    visibility,
  });

  if (audioId) newPlaylist.items = [audioId as any];

  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
}

export async function updatePlaylist(req: UpdatePlaylistRequest, res: Response) {
  const { id, title, item, visibility } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title, visibility },
    { new: true }
  );

  if (!playlist) return res.status(404).json({ error: 'Playist not found' });

  if (item) {
    const audio = await Audio.findById(item);

    if (!audio) return res.status(404).json({ error: 'Audio not found' });
    // playlist.items.push(audio._id);
    // await playlist.save();

    await Playlist.findByIdAndUpdate(playlist._id, { $addToSet: { items: item } });
  }

  res.status(201).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
}
