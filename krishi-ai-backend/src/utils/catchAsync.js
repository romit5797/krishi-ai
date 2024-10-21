import { handleError } from "../helpers/error-handler.js";

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => handleError(res, error));
  };
};

export default catchAsync;
