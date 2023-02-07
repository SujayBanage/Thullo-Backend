import { Schema, model } from "mongoose";

const attachmentUserSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: [true, "must provide user_id"],
  },
  username: {
    type: String,
    required: [true, "must provide a username"],
  },
});

const attachmentSchema = new Schema(
  {
    name: { type: String, required: [true, "attachment must have a name"] },
    src: {
      type: String,
      required: [true, "attachment must have a source"],
    },
    public_key: {
      type: String,
      required: [true, "attachment must have a public key"],
    },
    user: attachmentUserSchema,
  },
  { timestamps: true }
);

const Attachment = model("Attachment", attachmentSchema);
export default Attachment;
