import { Schema, model } from "mongoose";

const commentUserSchema = new Schema({
  user_id: Schema.Types.ObjectId,
  username: String,
  profileImage: String,
});

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Comment must have text"],
    },
    user: commentUserSchema,
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);
export default Comment;
