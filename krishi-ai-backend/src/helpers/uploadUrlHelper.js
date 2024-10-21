const AWS = require("aws-sdk");
const axios = require("axios");
const {
  AWS_REGION,
  UPLOAD_BUCKET_URL,
  UPLOAD_BUCKET_NAME,
  MEDIA_LIBRARY_ACCESS_KEY,
  MEDIA_LIBRARY_SECRET,
  CONTACT_BUCKET_NAME,
  CONTACT_BUCKET_URL,
  VIRTUAL_NUMBER_BUCKET,
  VIRTUAL_NUMBER_BUCKET_URL,
} = require("../config/config");

AWS.config.update({
  region: AWS_REGION,
  accessKeyId: MEDIA_LIBRARY_ACCESS_KEY,
  secretAccessKey: MEDIA_LIBRARY_SECRET,
});
const s3 = new AWS.S3();

const URL_EXPIRATION_SECONDS = 300;

const getApplicableBucket = (fileType) => {
  if (fileType === "CONTACT")
    return { bucketName: CONTACT_BUCKET_NAME, bucketURL: CONTACT_BUCKET_URL };

  return {
    bucketName: UPLOAD_BUCKET_NAME,
    bucketURL: UPLOAD_BUCKET_URL,
  };
};

const getUploadURL = async function (
  assistantId,
  fileName,
  ContentType,
  fileType,
  allowLargeContact
) {
  const formattedFileName = fileName
    .substring(0, 500)
    .replace(/[^a-zA-Z0-9. ]/g, "");
  const randomID = parseInt(Math.random() * 10000000);
  const Key = `${fileType}/${assistantId}/${randomID}_${formattedFileName}`;
  const MB_1 = 1000000;
  let maxSize = 0;
  if (fileType === "IMAGE") maxSize = 5 * MB_1;
  if (fileType === "VIDEO") maxSize = 16 * MB_1;
  if (fileType === "FILE") maxSize = 100 * MB_1;
  if (fileType === "AUDIO") maxSize = 16 * MB_1;
  if (fileType === "CONTACT") maxSize = (allowLargeContact ? 200 : 50) * MB_1;

  // Applicable Bucket
  const applicableBucket = getApplicableBucket(fileType);

  // Get signed URL from S3
  const s3Params = {
    Bucket: applicableBucket.bucketName,
    Fields: {
      Key,
      "Content-Type": ContentType,
    },
    Expires: URL_EXPIRATION_SECONDS,
    Conditions: [["content-length-range", 0, maxSize]],
  };
  const uploadURL = s3.createPresignedPost(s3Params);
  return JSON.stringify({
    uploadURL: uploadURL,
    filePath: Key,
    fullUrl: `${applicableBucket.bucketURL}${encodeURI(Key)}`,
  });
};

const getUploadImageURL = async function (assistantId, fileName) {
  const formattedFileName = fileName
    .substring(0, 500)
    .replace(/[^a-zA-Z0-9 ]/g, "");
  const randomID = Math.floor(Math.random() * 10000000);
  const Key = `IMAGE/${assistantId}/${randomID}_${formattedFileName}`;

  // Applicable Bucket
  const applicableBucket = getApplicableBucket(null);

  const presignedPUTURL = s3.getSignedUrl("putObject", {
    Bucket: applicableBucket.bucketName,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
  });

  return {
    uploadURL: presignedPUTURL,
    filePath: Key,
    fullUrl: `${applicableBucket.bucketURL}${encodeURI(Key)}`,
  };
};

const uploadAndGetS3MediaUrl = async (url, assistantId, fileName) => {
  try {
    const mediaFile = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const responseURL = await getUploadImageURL(assistantId, fileName);

    const { data, headers } = mediaFile || {};
    const { uploadURL, fullUrl } = responseURL || {};

    const axiosResponse = await axios.put(
      uploadURL,
      data,
      headers["content-type"]
        ? {
            headers: {
              "Content-Type": headers["content-type"],
            },
          }
        : {}
    );

    console.log("File uploaded successfully,\n", axiosResponse.data);

    return fullUrl;
  } catch (error) {
    console.log("Error while uploding incomin file to s3 :", error);
  }
};

const panCardUpdate = async (pan, assistantId) => {
  const { mediaType, fileName } = pan;
  const panFileName = fileName.substring(0, 500).replace(/[^a-zA-Z0-9. ]/g, "");
  const randomID = parseInt(Math.random() * 10000000);
  const Key = `${"IMAGE"}/${assistantId}/${randomID}_${panFileName}`;
  const MB_1 = 1000000;
  let maxSize = 5 * MB_1;
  const s3PanParams = {
    Bucket: VIRTUAL_NUMBER_BUCKET,
    Fields: {
      Key,
      "Content-Type": mediaType,
    },
    Expires: URL_EXPIRATION_SECONDS,
    Conditions: [["content-length-range", 0, maxSize]],
  };
  const uploadPanURL = s3.createPresignedPost(s3PanParams);
  const bucketURL = VIRTUAL_NUMBER_BUCKET_URL;
  return {
    panUrl: {
      uploadURL: uploadPanURL,
      filePath: Key,
      fullUrl: `${bucketURL}${encodeURI(Key)}`,
    },
  };
};

const aadharCardUpdate = async (aadhar, assistantId) => {
  const { name, type } = aadhar;
  const aadharFileName = name.substring(0, 500).replace(/[^a-zA-Z0-9. ]/g, "");
  const randomID = parseInt(Math.random() * 10000000);
  const Key = `${"IMAGE"}/${assistantId}/${randomID}_${aadharFileName}`;
  const MB_1 = 1000000;
  let maxSize = 5 * MB_1;
  const s3AadharParams = {
    Bucket: VIRTUAL_NUMBER_BUCKET,
    Fields: {
      Key,
      "Content-Type": type,
    },
    Expires: URL_EXPIRATION_SECONDS,
    Conditions: [["content-length-range", 0, maxSize]],
  };
  const uploadAadharURL = s3.createPresignedPost(s3AadharParams);
  const bucketURL = VIRTUAL_NUMBER_BUCKET_URL;
  return {
    aadharUrl: {
      uploadURL: uploadAadharURL,
      filePath: Key,
      fullUrl: `${bucketURL}${encodeURI(Key)}`,
    },
  };
};
module.exports = {
  getUploadURL,
  getUploadImageURL,
  uploadAndGetS3MediaUrl,
  panCardUpdate,
  aadharCardUpdate,
};
