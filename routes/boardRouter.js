import { Router } from "express";
const boardRouter = new Router();
import privateMiddleware from "../middleware/privateMiddleware.js";
import { cloudinaryBoardCoverUpload } from "../middleware/cloudinaryFileUpload.js";
import {
  createBoard,
  getBoardInfo,
  getAllBoards,
  changeVisibility,
  inviteUser,
  getAllInvites,
  updateDescription,
  joinBoard,
  removeUserFromBoard,
  deleteBoard,
  deleteInvitation,
  getBoardUsersById,
  updateBoardName,
} from "../controllers/boardControllers.js";

boardRouter.route("/name").patch(updateBoardName);

boardRouter
  .route("/create")
  .post(privateMiddleware, cloudinaryBoardCoverUpload, createBoard);
boardRouter
  .route("/getBoardInfo/:board_id")
  .get(privateMiddleware, getBoardInfo);
boardRouter.route("/getAllBoards").get(privateMiddleware, getAllBoards);
boardRouter.route("/visibility").patch(privateMiddleware, changeVisibility);
boardRouter
  .route("/invites")
  .post(privateMiddleware, inviteUser)
  .get(privateMiddleware, getAllInvites)
  .delete(privateMiddleware, deleteInvitation);

boardRouter
  .route("/boardMembers")
  .patch(privateMiddleware, joinBoard)
  .delete(privateMiddleware, removeUserFromBoard);
boardRouter.route("/description").patch(privateMiddleware, updateDescription);
boardRouter.route("/remove").delete(privateMiddleware, deleteBoard);
boardRouter.route("/users/:board_id").get(privateMiddleware, getBoardUsersById);

export default boardRouter;
