import { AudioDocument } from '@/models/audio';
import { Request } from 'express';
import { ObjectId } from 'mongoose';

export type PopulateFavoriteList = AudioDocument<{ _id: ObjectId; name: string }>;

export interface CreatePlaylistRequest extends Request {
  body: {
    title: string;
    audioId: string;
    visibility: 'public' | 'private';
  };
}
export interface UpdatePlaylistRequest extends Request {
  body: {
    id: string;
    title: string;
    item: string;
    visibility: 'public' | 'private';
  };
}
