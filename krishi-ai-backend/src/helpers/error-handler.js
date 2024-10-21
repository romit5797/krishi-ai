class CustomError extends Error {
  constructor(code, name, message) {
    super(message);
    this.code = code;
    this.name = name;
  }
}

const handleError = (res, error) => {
  console.error(error);
  if (error.code) {
    return res
      .status(error.code)
      .send({ name: error.name, message: error.message });
  } else if (error.errors) {
    return res.status(400).send({
      message: "Some error ocurred",
      error: error.message,
    });
  } else {
    return res.status(500).send({
      message: error?.response?.data?.message || "Some error ocurred",
    });
  }
};

export { CustomError, handleError };
