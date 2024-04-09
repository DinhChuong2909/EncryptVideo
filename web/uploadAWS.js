require("dotenv").config(); // Load environment variables from .env file

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const fs = require("fs");

// Set your AWS credentials (make sure to configure your AWS CLI or use environment variables)
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;
const videoFilePath = "./output_video_with_data.mp4";
const region = process.env.AWS_REGION;

// Initialize S3 client
const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

// Read the video file
const videoFile = fs.readFileSync(videoFilePath);

// Upload the video file to S3
const uploadVideo = async () => {
  const params = {
    Bucket: bucketName,
    Key: "output_video_with_data.mp4",
    Body: videoFile,
    ContentType: "video/mp4",
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    console.log("Video uploaded successfully:", data);
  } catch (err) {
    console.error("Error uploading video:", err);
  }
};

// Generate a pre-signed URL for the uploaded video
const generatePresignedUrl = async () => {
  const params = {
    Bucket: bucketName,
    Key: "output_video_with_data.mp4",
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    console.log("Pre-signed URL generated successfully:", url);
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
  }
};


// Call the functions
async function main() {
  await uploadVideo();
  await generatePresignedUrl();
}

main();