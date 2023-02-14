import { Router } from "express";
const taskRouter = new Router();
import {
  createTask,
  deleteTask,
  shiftTask,
  addComment,
  deleteComment,
  taskAttachmentDelete,
  taskAttachmentUpload,
  taskDescriptionUpdate,
  taskLableAdd,
  taskUserAdd,
  getAttachmentById,
  getCommentById,
  getTaskById,
  taskImageUpdate,
  getAllTasksByColumnId,
  taskDND,
  updateTaskName,
  removeUserFromTask,
} from "../controllers/taskController.js";
import privateMiddleware from "../middleware/privateMiddleware.js";

import {
  cloudinaryAttachmentUpload,
  cloudinaryAttachmentDelete,
} from "../middleware/cloudinaryFileUpload.js";

taskRouter
  .route("/")
  .post(privateMiddleware, createTask)
  .patch(privateMiddleware, taskDND)
  .delete(privateMiddleware, deleteTask);

taskRouter.route("/name").patch(updateTaskName);

taskRouter
  .route("/attachment")
  .post(privateMiddleware, cloudinaryAttachmentUpload, taskAttachmentUpload)
  .delete(privateMiddleware, cloudinaryAttachmentDelete, taskAttachmentDelete);
taskRouter
  .route("/comment")
  .post(privateMiddleware, addComment)
  .delete(privateMiddleware, deleteComment);
taskRouter
  .route("/description")
  .patch(privateMiddleware, taskDescriptionUpdate);
taskRouter.route("/label").patch(privateMiddleware, taskLableAdd);
taskRouter
  .route("/user")
  .patch(privateMiddleware, taskUserAdd)
  .delete(privateMiddleware, removeUserFromTask);
taskRouter.route("/:task_id").get(privateMiddleware, getTaskById);
taskRouter
  .route("/attachment/:attachment_id")
  .get(privateMiddleware, getAttachmentById);
taskRouter.route("/comment/:comment_id").get(privateMiddleware, getCommentById);
taskRouter.route("/image").patch(privateMiddleware, taskImageUpdate);
taskRouter
  .route("/column/:column_id")
  .get(privateMiddleware, getAllTasksByColumnId);

export default taskRouter;
