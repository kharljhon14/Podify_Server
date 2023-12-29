import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRECT } from '@/utils/variables';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRECT,
  secure: true,
});

export default cloudinary;
