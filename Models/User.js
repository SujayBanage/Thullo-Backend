import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from "../config.js";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "user must have a username"],
      validate: [
        validator.isAlphanumeric,
        "username must only contains characters",
      ],
      index: true,
    },
    email: {
      type: String,
      require: [true, "user must have a email"],
      unique: [true, "user email must be unique"],
      validate: [validator.isEmail, "user must provide proper email"],
    },
    profileImage: {
      type: String,
      require: [true, "user must have profile image"],
    },
    profileImage_id: String,
    Boards: [mongoose.Schema.Types.ObjectId],
    password: {
      type: String,
      require: [true, "user must have a password"],
      validate: [
        validator.isStrongPassword,
        "Password must be of minimun length 8",
      ],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  username: "text",
});

userSchema.pre("save", async function (req, res, next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log("hashed password is : ", hashedPassword);
    this.password = hashedPassword;
    // await this.save();
    return next();
  } catch (err) {
    console.log(err);
    console.log("error while hashing the password");
  }
});

userSchema.methods.signJwtTokens = function () {
  const accessToken = jwt.sign({ id: this._id }, JWT_ACCESS_KEY, {
    expiresIn: 1800,
  });
  const refreshToken = jwt.sign({ id: this._id }, JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
  return {
    accessToken,
    refreshToken,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
