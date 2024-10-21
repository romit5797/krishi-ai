import express from "express";
import * as messagesController from "../controllers/messagesController.js";
import * as authController from "../controllers/authController.js";

//Enabling merge params to get the paramters in a nested route
const router = express.Router({
  mergeParams: true,
});

router
  .route("/")
  // .get(messagesController.protect, messagesController.getAllUsers)
  .post(
    authController.validateSignature,
    messagesController.generateBotResponse
  );

export default router;
