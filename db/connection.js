import mongoose from "mongoose";
import { MONGO_URI } from "../config.js";

console.log(MONGO_URI);

mongoose.set("strictQuery", false);

const connection = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
  } catch (err) {
    console.log(err.message);
  }
};

export default connection;
