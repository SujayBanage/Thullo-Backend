import { Schema, model } from "mongoose";

const taskColumnSchema = new Schema({
  name: String,
  column_id: Schema.Types.ObjectId,
});

const taskLabelSchema = new Schema({
  text: String,
  color: String,
});

const taskUserSchema = new Schema({
  user_id: Schema.Types.ObjectId,
  username: String,
  profileImage: String,
});

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "card must have a name"],
    },
    column: taskColumnSchema,
    description: String,
    attachments: [Schema.Types.ObjectId],
    comments: [Schema.Types.ObjectId],
    image: String,
    labels: [taskLabelSchema],
    admin: Schema.Types.ObjectId,
    users: [taskUserSchema],
  },
  {
    timeseries: true,
  }
);

const Task = model("Task", taskSchema);

export default Task;
