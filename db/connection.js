import { connect, set } from "mongoose";
import { MONGO_URI } from "../config.js";

console.log(MONGO_URI);

set("strictQuery", false);

const connection = () => {
  connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((res) => {
      console.log("connected to mongodb!!");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connection;
