import { v2 } from "cloudinary";
import {
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_KEY,
} from "../config.js";
const cloudinary = v2;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;
