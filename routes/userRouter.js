import { Router } from "express";
import privateMiddleware from "../middleware/privateMiddleware.js";
const userRouter = new Router();
import { getUsers } from "../controllers/userControllers.js";
userRouter.route("/getInfo").get(privateMiddleware, (req, res) => {
  const { _id, username, email, profileImage } = req.user;
  return res.status(200).send({
    user: {
      _id,
      username,
      profileImage,
      email,
    },
  });
});
userRouter.route("/users").get(privateMiddleware, getUsers);

export default userRouter;
