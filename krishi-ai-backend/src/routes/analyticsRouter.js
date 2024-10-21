import express from "express";
import * as messagesController from "../controllers/messagesController.js";
import * as analyticsController from "../controllers/analyticsController.js";

//Enabling merge params to get the paramters in a nested route
const router = express.Router({
  mergeParams: true,
});

router.route("/").get(analyticsController.getDashboardAnalytics);

export default router;
