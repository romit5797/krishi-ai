import express from "express";
import * as healthCheckController from "../controllers/healthCheckController.js";

const router = express.Router({
  mergeParams: true,
});

router.route("/").get(healthCheckController.ping);

export default router;
