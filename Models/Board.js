import { Schema, model } from "mongoose";

const boarduserSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
});

const boardColumnSchema = new Schema({
  column_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: String,
});

const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Board must have a name"],
    },
    visibility: {
      type: String,
      required: [true, "Board must have a visibility"],
      enum: ["Public", "Private"],
      default: "Public",
    },
    admin: boarduserSchema,
    users: [boarduserSchema],
    description: {
      type: String,
    },
    columns: [boardColumnSchema],
    boardCoverImage: String,
    boardCoverImage_id: String,
  },
  { timestamps: true }
);

const Board = model("Board", boardSchema);
export default Board;
