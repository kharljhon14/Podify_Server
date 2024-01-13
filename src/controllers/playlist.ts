import Audio from '@/models/audio';
import Playlist from '@/models/playlist';
import { CreatePlaylistRequest, UpdatePlaylistRequest } from '@/types/audio';
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

export async function updatePlaylist(req: UpdatePlaylistRequest, res: Response) {}
