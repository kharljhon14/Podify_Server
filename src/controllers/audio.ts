import { RequestWithFiles } from '@/middlewares/fileParser';
import { Category } from '@/utils/audioCategories';
import { Response } from 'express';
import formidable from 'formidable';
import cloudinary from '@/cloud';
import Audio from '@/models/audio';

interface CreateAudioRequest extends RequestWithFiles {
  body: {
    title: string;
    about: string;
    category: Category;
  };
}

export async function createAudio(req: CreateAudioRequest, res: Response) {
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const audioFile = req.files?.file as formidable.File;
  const { id } = req.user;

  if (!audioFile) return res.status(422).json({ error: 'Audio file is missing' });

  const audioResponse = await cloudinary.uploader.upload(audioFile.filepath, {
    resource_type: 'video',
  });

  const newAudio = new Audio({
    title,
    about,
    category,
    owner: id,
    file: { url: audioResponse.url, publicId: audioResponse.public_id },
  });

  if (poster) {
    const posterResponse = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: 'thumb',
      gravity: 'face',
    });

    newAudio.poster = { url: posterResponse.url, publicId: posterResponse.public_id };
  }

  await newAudio.save();

  res
    .status(201)
    .json({ audio: { title, about, file: newAudio.file.url, poster: newAudio.poster?.url } });
}

export async function updateAudio(req: CreateAudioRequest, res: Response) {
  const { title, about, category } = req.body;
  const poster = req.files?.poster as formidable.File;
  const { id } = req.user;

  const { audioId } = req.params;

  const audio = await Audio.findOneAndUpdate(
    { owner: id, _id: audioId },
    { title, about, category },
    { new: true }
  );

  if (!audio) return res.status(404).json('Record not found');

  if (poster) {
    if (audio.poster?.publicId) {
      await cloudinary.uploader.destroy(audio.poster.publicId);
    }
    const posterResponse = await cloudinary.uploader.upload(poster.filepath, {
      width: 300,
      height: 300,
      crop: 'thumb',
      gravity: 'face',
    });

    audio.poster = { url: posterResponse.url, publicId: posterResponse.public_id };
    await audio.save();
  }

  res
    .status(200)
    .json({ audio: { title, about, file: audio.file.url, poster: audio.poster?.url } });
}
