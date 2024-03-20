const VideoEncryptor  = require("video-encryptor");
const videoEncryptor = new VideoEncryptor();

const videoPath = "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/suburbia-aerial.mp4";
const videoDecryptPath = './encrypted-video.encrypted'
const encryptionKey = "abbas1234";
videoEncryptor.encryptVideo(videoPath, encryptionKey, videoDecryptPath);

const encryptedFilePath = "D:/Code/Web/EncryptVideo/api/src/suburbia-aerial.encrypted";
const decryptedVideoPath = "decrypted-video";
videoEncryptor.decryptVideo(
  encryptedFilePath,
  encryptionKey,
  decryptedVideoPath
)

function decryptedVideo(path, key, outputPath) {
  const decryptionKey = "abbas1234";
  const decryptedFilePath = "decrypted-video.mp4";
  videoEncryptor.decryptVideo(encryptedFilePath, decryptionKey, decryptedFilePath);
}

