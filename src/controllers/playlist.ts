import Audio from '@/models/audio';
import Playlist from '@/models/playlist';
import { CreatePlaylistRequest, UpdatePlaylistRequest } from '@/types/audio';
import { error } from 'console';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

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

export async function removePlaylist(req: Request, res: Response) {
  const { playlistId, audioId, all } = req.query;

  if (!isValidObjectId(playlistId)) return res.status(422).json({ error: 'Invalid playlist Id' });

  if (all === 'yes') {
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: req.user.id });

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  }

  if (audioId) {
    if (!isValidObjectId(audioId)) return res.status(422).json({ error: 'Invalid audio Id' });

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: req.user.id },
      { $pull: { items: audioId } }
    );

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  }

  res.json({ success: true });
}

export async function getPlaylistByProfile(req: Request, res: Response) {
  const playlist = await Playlist.find({ owner: req.user.id, visibility: { $ne: 'auto' } }).sort(
    '-createdAt'
  );
  res.json({ data: playlist });
}
