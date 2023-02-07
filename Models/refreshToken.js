import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    unique: true,
    required: true,
  },
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
