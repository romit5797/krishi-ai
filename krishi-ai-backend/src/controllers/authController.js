import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import hashingService from "../services/hashingService.js";

//Verify route from accessing unless user is logged in
export const validateSignature = catchAsync(async (req, res, next) => {
  const notification = req.body;
  const receivedSignature = req.headers["x-aisensy-signature"];
  const sharedSecret = "WEBHOOK_SHARED_SECRET";

  // Provide the notificaiton data as it is
  const generatedSignature = await hashingService.createHash(
    `${JSON.stringify(notification)}`,
    sharedSecret
  );

  if (receivedSignature === generatedSignature) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  next();
});
