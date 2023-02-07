import { Schema, model } from "mongoose";

const InvitationSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    required: [true, "Invitation must have Inviter"],
  },
  fromProfileImage: {
    type: String,
    required: [true, "Invitation must have Inviter Image"],
  },
  to: {
    type: Schema.Types.ObjectId,
    required: [true, "Invitation must have guest user"],
  },
  board_id: {
    type: Schema.Types.ObjectId,
    required: [true, "Invitation must have board_id"],
  },
  message: {
    type: String,
    required: [true, "Invitation must have Invitation message"],
  },
});

const Invite = model("Invite", InvitationSchema);

export default Invite;
