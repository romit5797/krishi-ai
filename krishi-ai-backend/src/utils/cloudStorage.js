import path from "path";
import AWS from "aws-sdk";
import fs from "fs";
import {
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
} from "../config/config.js"; // Ensure the file extension is included

// Configure AWS
AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const uploadFileToCloudStorage = async (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: `audio/${fileName}`, // Customize the path as needed
      Body: fileContent,
      ContentType: "audio/mpeg",
      ACL: "public-read", // Make sure the file is publicly accessible
    };

    const uploadResult = await s3.upload(params).promise();

    // Delete the local file after successful upload
    fs.unlinkSync(filePath);

    return uploadResult.Location; // This is the public URL of the uploaded file
  } catch (error) {
    console.error("Error uploading file to S3:", error.message);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};
