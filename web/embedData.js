const fs = require("fs");
const Jimp = require("jimp");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Function to encode data into video frames using LSB (Least Significant Bit) technique
const path = require("path");

async function encodeLSB(videoPath, data) {
  try {
    const videoBuffer = fs.readFileSync(videoPath);
    const videoData = new Uint8Array(videoBuffer);

    data = '\t' + data + '\n'; // Add delimiters to identify the data

    const binaryData = [...data].map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');

    let dataIndex = 0;

    // Iterate over the video data and modify LSBs
    for (let i = 128; i < videoData.length; i++) {
      const modifiedByte = (videoData[i] & 0xFE) | parseInt(binaryData[dataIndex], 2);
      videoData[i] = modifiedByte;

      dataIndex++;
      if (dataIndex >= binaryData.length) {
        break; 
      }
    }

    fs.writeFileSync('output_video_with_data.mp4', videoData);
    console.log('Data embedded successfully.');
  } catch (error) {
    console.error('Error during data embedding:', error.message);
  }
}


async function decodeLSB(videoPath, outputPath) {
  const videoBuffer = fs.readFileSync(videoPath);
  const videoData = new Uint8Array(videoBuffer);

  let binaryData = "";

  for (let i = 0; i < videoData.length; i++) {
    binaryData += (videoData[i] & 1).toString();
  }

  // Convert binary data back to characters
  let extractedData = "";
  for (let i = 0; i < binaryData.length; i += 8) {
    const charByte = binaryData.slice(i, i + 8);
    extractedData += String.fromCharCode(parseInt(charByte, 2));

    if (extractedData.endsWith('\n')) {
      break;
    }
  }

  const startIndex = extractedData.indexOf('\t') + 1;
  const endIndex = extractedData.indexOf('\n', startIndex);
  const middleString = extractedData.slice(startIndex, endIndex);

  fs.writeFileSync(outputPath, Buffer.from(middleString));
  console.log(`Extracted data saved to ${outputPath}`);
  return middleString;
}

// Example usage
const encodePath = "./suburbia-aerial.mp4"; // Replace with your input video path

const decodePath = "./output_video_with_data.mp4"; // Path to the video with embedded data
const outputPath = "./output_video_decode.txt"; // Path to save the extracted data

async function decodeAndPrintData() {
  const dataToEmbed = "Hello, this is a hidden message!";
  await encodeLSB(encodePath, dataToEmbed);
  await decodeLSB(decodePath, outputPath);
}

decodeAndPrintData();
