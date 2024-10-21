// Import dotenv config first to ensure environment variables are loaded
import "./config.mjs";
import { app } from "./app.js";
import dbConnect from "./db/mongodb-instance.js";
import throng from "throng";
import messagesService from "./services/messages.service.js";


const port = process.env.PORT || 3333;

const worker = async () => {
  try {
    console.log(`Server: starting in ${process.env.mode || "default"} mode`);
    await dbConnect();
    console.log("MongoDb: connected");

    app.listen(port, () => console.log(`Server: listening on port ${port}`));
    console.log("Setup Complete!");
  } catch (error) {
    console.error(error);
  }
};

const count = Number(process.env.WEB_CONCURRENCY || 2);
if (process.env.NODE_ENV === "production" && count >= 1) {
  throng({ worker, count });
} else {
  worker();
}
