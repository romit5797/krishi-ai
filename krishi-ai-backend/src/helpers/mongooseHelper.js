import mongoose from "mongoose";

const validateObjectId = (objectId) => {
  try {
    // Skip nested objects validation
    if (typeof objectId === "object" && objectId?._bsontype !== "ObjectID") {
      return true;
    }
    const testId = objectId.toString();
    const parsedId = new mongoose.Types.ObjectId(testId).toString();
    return parsedId === testId;
  } catch (error) {
    return false;
  }
};

const convertToCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
};

const convertObjectKeysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => convertObjectKeysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = convertToCamelCase(key);
      result[newKey] = convertObjectKeysToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

const convertStringNumbersToNumbers = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertStringNumbersToNumbers(item));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      let value = obj[key];
      if (
        typeof value === "string" &&
        !isNaN(value) &&
        value.trim() !== "" &&
        !key.includes("Id")
      ) {
        acc[key] = Number(value);
      } else if (
        Array.isArray(value) ||
        (value !== null && typeof value === "object")
      ) {
        acc[key] = convertStringNumbersToNumbers(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
  return obj;
};

export {
  validateObjectId,
  convertObjectKeysToCamelCase,
  convertStringNumbersToNumbers,
};
