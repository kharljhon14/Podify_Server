import Audio from '@/models/audio';
import Playlist from '@/models/playlist';
import { CreatePlaylistRequest, PopulateFavoriteList, UpdatePlaylistRequest } from '@/types/audio';
import { error } from 'console';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { title } from 'process';

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
  const { pageNumber = '0', limit = '20' } = req.query as { pageNumber: string; limit: string };

  const playlist = await Playlist.find({ owner: req.user.id, visibility: { $ne: 'auto' } })
    .skip(parseInt(pageNumber) * parseInt(limit))
    .limit(parseInt(limit))
    .sort('-createdAt');

  const newPlaylist = playlist.map((item) => ({
    id: item._id,
    title: item.title,
    itemCount: item.items.length,
    visibility: item.visibility,
  }));

  res.json({ data: newPlaylist });
}

export async function getAudios(req: Request, res: Response) {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) return res.status(422).json({ error: 'Invalid playlist ID' });

  const playlist = await Playlist.findOne({ owner: req.user.id, _id: playlistId }).populate<{
    items: PopulateFavoriteList[];
  }>({
    path: 'items',
    populate: {
      path: 'owner',
      select: 'name',
    },
  });

  if (!playlist) return res.json({ data: [] });

  const audios = playlist.items.map((item) => ({
    id: item._id,
    title: item.title,
    category: item.category,
    file: item.file.url,
    poster: item.poster?.url,
    owner: { name: item.owner.name, id: item.owner._id },
  }));

  res.json({
    data: {
      id: playlist._id,
      title: playlist.title,
      audios,
    },
  });
}
