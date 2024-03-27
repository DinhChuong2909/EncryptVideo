const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

// Input video path (replace with your actual video file)
const inputVideoPath = './suburbia-aerial.mp4';

// Watermark image path (replace with your actual watermark image)
const watermarkImagePath = 'watermark.png';

// Output video path (where the watermarked video will be saved)
const outputVideoPath = 'output.mp4';

// Apply the watermark using FFmpeg
ffmpeg(inputVideoPath)
  .input(watermarkImagePath)
  .complexFilter(
      // Overlay the watermark at a specific position (e.g., bottom-right)
      "[0:v][1:v]overlay=x=W-w-10:y=H-h-10",
      { shortest: 1 }
  )
  .videoCodec('libx264')
  .on('end', () => {
      console.log('Watermark added successfully!');
  })
  .on('error', (err) => {
      console.error('Error adding watermark:', err);
  })
  .save(outputVideoPath);