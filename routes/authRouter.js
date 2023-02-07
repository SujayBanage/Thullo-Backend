import { Router } from "express";
const authRouter = new Router();
import {
  userLogin,
  userSignup,
  refresh,
  userLogout,
} from "../controllers/authControllers.js";
import { cloudinaryProfileUpload } from "../middleware/cloudinaryFileUpload.js";
import privateMiddleware from "../middleware/privateMiddleware.js";
authRouter.route("/login").post(userLogin);
authRouter.route("/signup").post(cloudinaryProfileUpload, userSignup);
authRouter.route("/refresh").get(refresh);
authRouter.route("/logout").delete(privateMiddleware, userLogout);

export default authRouter;
