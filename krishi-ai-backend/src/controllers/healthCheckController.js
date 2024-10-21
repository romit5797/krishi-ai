import catchAsync from "../utils/catchAsync.js";

export const ping = catchAsync(async (req, res, next) => {
  res.status(200).send({ data: "Pong!" });
});
