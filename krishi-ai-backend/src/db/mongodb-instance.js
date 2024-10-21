import mongoose from "mongoose";
import { mongoURI } from "../config/config.js";

mongoose.Promise = global.Promise;

const dbConnect = async () => {
  await mongoose.connect(mongoURI, {});
};

export const dbDisconnect = async () => {
  await mongoose.disconnect();
};

export default dbConnect;
