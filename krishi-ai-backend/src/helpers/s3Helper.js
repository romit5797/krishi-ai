const {
  AWS_REGION,
  MEDIA_LIBRARY_ACCESS_KEY,
  MEDIA_LIBRARY_SECRET,
} = require("../config/config");
const fs = require("fs");
const { promisify } = require("util");
const S3 = require("aws-sdk/clients/s3");

const unlinkAsync = promisify(fs.unlink);

const config = {
  region: AWS_REGION,
  accessKeyId: MEDIA_LIBRARY_ACCESS_KEY,
  secretAccessKey: MEDIA_LIBRARY_SECRET,
};

const s3 = new S3(config);

// UPLOAD FILE TO S3
function uploadToS3(bucketName, pathPrefix, file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: pathPrefix + file.originalname,
  };

  return s3.upload(uploadParams).promise();
}

/**
 * Deletes an object from an S3 bucket.
 *
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key of the object to delete.
 * @returns A promise that resolves when the object is deleted.
 */
function deleteFromS3(bucketName, key) {
  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  return s3.deleteObject(deleteParams).promise();
}

module.exports = { uploadToS3, deleteFromS3, unlinkAsync };
