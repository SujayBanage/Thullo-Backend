import RefreshToken from "../Models/refreshToken.js";
import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from "../config.js";

const userSignup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      error: true,
      message: "Email and Password are Required!",
    });
  }

  try {
    const userExists = await User.findOne({
      $text: { $search: email, $caseSensitive: false },
    });

    if (userExists) {
      return res.status(400).send({
        error: true,
        message: "User Already Exists!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: err.message,
    });
  }

  let newUser;

  try {
    newUser = await User.create({
      username,
      email,
      password,
      profileImage: req.image_url,
      profileImage_id: req.image_public_id,
    });
    console.log("new user is : ", newUser);
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  const { accessToken, refreshToken } = newUser.signJwtTokens();

  try {
    // * whitelisting the refresh tokens
    await RefreshToken.create({
      user_id: newUser._id,
      token: refreshToken,
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  // * setting the cookie
  res.cookie("auth_cookie", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    // secure: process.env.NODE_ENV === "prodcution" ? true : false,
    // httpOnly: process.env.NODE_ENV === "prodcution" ? false : true,
    secure: true,
    sameSite: "none",
  });

  // * sending the
  res.status(200).send({
    error: false,
    message: "User Signup Successfull!",
    accessToken,
  });
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      error: true,
      message: "Email and Password are Required!",
    });
  }

  let user;
  try {
    user = await User.findOne({
      $text: { $search: email, $caseSensitive: false },
    });

    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User Not Found!",
      });
    }

    const checkPassword = bcrypt.compare(password, user.password);
    if (!user || !checkPassword) {
      return res.status(404).send({
        error: false,
        message: "User Not Found!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }

  const { accessToken, refreshToken } = user.signJwtTokens();

  try {
    // * whitelisting the refresh tokens
    await RefreshToken.create({
      user_id: user._id,
      token: refreshToken,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  // * setting the cookie
  res.cookie("auth_cookie", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    // httpOnly: process.env.NODE_ENV === "production" ? false : true,
    // secure: process.env.NODE_ENV === "prodcution" ? true : false,
    secure: true,
    sameSite: "none",
  });

  // * sending the
  res.status(200).send({
    error: false,
    message: "User Login Successfull!",
    accessToken,
  });
};

const userLogout = async (req, res) => {
  console.log("user logout running!!");
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const refreshToken = req.cookies.auth_cookie;
    if (!accessToken || !refreshToken) {
      return res.status(401).send({
        error: true,
        message: "Not Authorized!",
      });
    }
    await RefreshToken.deleteMany({ user_id: req.user._id });
    res.clearCookie("auth_cookie");
    res.status(200).send({
      error: false,
      message: "user logout successfull!",
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

const refresh = async (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
    token = req.headers.authorization.split(" ")[1];
  }

  const { id } = jwt_decode(token);

  const accessTokenUser = await User.findById({ _id: id });

  if (!accessTokenUser) {
    return res.status(401).send({
      unauthorized: true,
    });
  }

  const refreshTokenFromCookie = req.cookies.auth_cookie;
  console.log("refresh token from cookie : ", refreshTokenFromCookie);
  let user_id;
  try {
    const verifyToken = jwt.verify(refreshTokenFromCookie, JWT_REFRESH_KEY);
    console.log("verifid token : ", verifyToken);
    user_id = verifyToken.id;
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: err.message,
    });
  }
  let user;
  try {
    user = await User.findById(user_id);
    console.log("user from refresh token : ", user);
    if (!user || user.email !== accessTokenUser.email) {
      return res.status(404).send({
        message: "Invalid token!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  let isValid;
  try {
    isValid = await RefreshToken.findOne({
      user_id: user._id,
      token: refreshTokenFromCookie,
    });
    console.log("valid token from db: ", isValid);
    if (!isValid) {
      return res.status(401).send({
        message: "Invalid Token!",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  const { accessToken, refreshToken } = user.signJwtTokens();

  try {
    await RefreshToken.updateOne(
      { user_id, _id: isValid._id, token: refreshTokenFromCookie },
      { token: refreshToken }
    );
  } catch (err) {
    return res.status(500).send({
      message: err.message,
    });
  }

  // * setting the cookie
  // * sending refresh token through user
  res.cookie("auth_cookie", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    // httpOnly: process.env.NODE_ENV === "prodcution" ? false : true,
    // secure: process.env.NODE_ENV === "prodcution" ? true : false,
    sameSite: "none",
    secure: true,
  });

  // * sending the accessToken to user
  res.status(200).send({
    message: "User Token Refresh successfull!",
    accessToken,
  });
};

export { userLogin, userSignup, refresh, userLogout };
