import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { JWT_ACCESS_KEY } from "../config.js";
const privateMiddleware = async (req, res, next) => {
  try {
    console.log("private middleware runnnng!");
    if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
      const accessToken = req.headers.authorization.split(" ")[1];
      console.log("accessToken is : ", accessToken);
      const verifyToken = jwt.verify(accessToken, JWT_ACCESS_KEY);
      console.log("verified token", verifyToken);
      let user;
      if (verifyToken) {
        user = await User.findById({ _id: verifyToken.id });
        console.log("verified user", user);
      }
      if (user && verifyToken) {
        req.user = user;
        return next();
      }
      return res.status(401).send({
        message: "user is unauthorized!",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

export default privateMiddleware;
