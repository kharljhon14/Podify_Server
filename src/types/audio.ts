import { AudioDocument } from '@/models/audio';
import { ObjectId } from 'mongoose';

export type PopulateFavoriteList = AudioDocument<{ _id: ObjectId; name: string }>;
