import { Router } from "express";
const columnRouter = new Router();
import {
  createColumn,
  updateColumnName,
  deleteColumn,
} from "../controllers/columnControllers.js";

import privateMiddleware from "../middleware/privateMiddleware.js";

columnRouter
  .route("/")
  .post(privateMiddleware, createColumn)
  .patch(privateMiddleware, updateColumnName)
  .delete(privateMiddleware, deleteColumn);

export default columnRouter;
