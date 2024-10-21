import express from "express";
import logger from "morgan";
import cors from "cors";
import helmet from "helmet";
import messagesRouter from "./routes/messagesRoutes.js";
import healthCheckRouter from "./routes/healthCheckRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js";
import { namespace } from "./config/config.js";

// Initialize express app -
export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.set("trust proxy", true);

// Routes
app.use(namespace + "/health-check", healthCheckRouter);
app.use(namespace + "/v1/messages", messagesRouter);
app.use(namespace + "/v1/analytics", analyticsRouter);

app.use(function (error, req, res, next) {
  console.log(error);
  const { errorCode, errorMessage } = error;
  res.status(errorCode || 404).send(errorMessage || "Server Error!");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error(reason, "Unhandled Rejection at Promise", promise);
});
