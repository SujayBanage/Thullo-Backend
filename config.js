import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =
  process.env.NODE_ENV == "development"
    ? process.env.MONGO_URI_DEV
    : process.env.MONGO_URI_PROD;

const PORT = process.env.PORT;
const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_PROD_URL
    : process.env.FRONTEND_DEV_URL;

export {
  MONGO_URI,
  PORT,
  JWT_ACCESS_KEY,
  JWT_REFRESH_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_KEY,
  FRONTEND_URL,
};
