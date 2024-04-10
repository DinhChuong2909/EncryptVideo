require("dotenv").config(); // Load environment variables from .env file

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { KMSClient, CreateKeyCommand } = require("@aws-sdk/client-kms");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const fs = require("fs");

// Set your AWS credentials (make sure to configure your AWS CLI or use environment variables)
const awsAccessKeyId = "ACCESS_KEY_ID";
const awsSecretAccessKey = "SECRET_ACCESS_KEY";
const bucketName = "BUCKET_NAME";
const region = "ap-southeast-2";


// Initialize S3 client
const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const kmsClient = new KMSClient({
  region: region,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

async function createSymmetricKey() {
  try {
    // Send a request to create a symmetric KMS key
    const { KeyMetadata } = await kmsClient.send(new CreateKeyCommand({
      KeyUsage: 'ENCRYPT_DECRYPT', // Specify key usage as 'ENCRYPT_DECRYPT' for symmetric key
      CustomerMasterKeySpec: 'SYMMETRIC_DEFAULT' // Specify the key spec as 'SYMMETRIC_DEFAULT' for symmetric key
    }));

    console.log('Symmetric KMS key created successfully:');
    console.log('Key ID:', KeyMetadata.KeyId);
    console.log('ARN:', KeyMetadata.Arn);
    
    return KeyMetadata.KeyId;
  } catch (error) {
    console.error('Error creating symmetric KMS key:', error);
  }
}

// Upload the video file to S3
const uploadVideo = async (videoFilePath, kmsKeyId) => {
  // Read the video file
  const videoFile = fs.readFileSync(videoFilePath);

  const params = {
    Bucket: bucketName,
    Key: "suburbia-aerial.mp4",
    Body: videoFile,
    ContentType: "video/mp4",
    ServerSideEncryption: "aws:kms", // Specify SSE-KMS for server-side encryption
    SSEKMSKeyId: kmsKeyId, // Specify the ARN of the AWS KMS key used for encryption
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
    Key: "suburbia-aerial.mp4",
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    console.log("Pre-signed URL generated successfully:", url);
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
  }
};

async function downloadEncryptedFileFromS3() {
  try {
    // Get the encrypted object from S3
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: "suburbia-aerial.mp4",
      })
    );

    // Create a writable stream and pipe the encrypted content to it
    const writableStream = fs.createWriteStream("encrypted_video.mp4");
    Body.pipe(writableStream);

    await new Promise((resolve, reject) => {
      writableStream.on("finish", resolve);
      writableStream.on("error", reject);
    });

    console.log("Encrypted file downloaded successfully.");
  } catch (error) {
    console.error("Error downloading encrypted file:", error);
  }
}

// Call the functions
async function main() {
  const videoFilePath = "./suburbia-aerial.mp4";
  const kmsKeyId = await createSymmetricKey();
  await uploadVideo(videoFilePath, kmsKeyId);
  await generatePresignedUrl();

  downloadEncryptedFileFromS3();
}

main();
