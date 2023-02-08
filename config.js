import dotenv from "dotenv";
dotenv.config();

console.log("node env is : ", process.env.NODE_ENV);

let MONGO_URI;

if (process.env.NODE_ENV === "production") {
  console.log("node env is : ", process.env.NODE_ENV);
  MONGO_URI = process.env.MONGO_URI_PROD;
} else {
  console.log("node env is : ", process.env.NODE_ENV);
  MONGO_URI = process.env.MONGO_URI_DEV;
}

const PORT = process.env.PORT;
const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
let FRONTEND_URL;
if (process.env.NODE_ENV === "production") {
  console.log("node env is : ", process.env.NODE_ENV);
  FRONTEND_URL = process.env.FRONT_PROD_URL;
} else {
  console.log("node env is : ", process.env.NODE_ENV);
  FRONTEND_URL = process.env.FRONT_DEV_URL;
}

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
