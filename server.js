import express from "express";
import connection from "./db/connection.js";
import { PORT } from "./config.js";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import boardRouter from "./routes/boardRouter.js";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import taskRouter from "./routes/taskRoutes.js";
import columnRouter from "./routes/columnRouter.js";
import { FRONTEND_URL } from "./config.js";

const app = express();
const port = PORT || 3000;

console.log("frontend url is : ", FRONTEND_URL);

app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL,
    methods: ["PUT", "PATCH", "GET", "POST", "DELETE", "HEAD"],
    preflightContinue: false,
    allowedHeaders: ["Content-Type", "authorization"],
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(cookieParser());

app.options(
  "*",
  cors({
    credentials: true,
    origin: FRONTEND_URL,
    methods: ["PUT", "PATCH", "GET", "POST", "DELETE", "HEAD"],
    preflightContinue: false,
    allowedHeaders: ["Content-Type", "authorization"],
  })
);

app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use("/api/column", columnRouter);

app.get("/", (req, res) => {
  res.send("hellooo from server ");
});

connection()
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port : ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
