import { Schema, model } from "mongoose";

const columnSchema = new Schema({
  name: {
    type: String,
    required: [true, "Column must have a name"],
  },
  tasks: [Schema.Types.ObjectId],
});

const Column = model("Column", columnSchema);
export default Column;
