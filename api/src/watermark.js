const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");

const { uploadVideo } = require("./cloudinary");

ffmpeg.setFfmpegPath(ffmpegPath);

const watermark = "../../web/watermark.png";

video = "output.mp4";

const watermarkVideo = async (inputVideoPath, outputVideoPath) => {
  const duration = await getInputVideoLength(inputVideoPath);
  console.log(inputVideoPath);
  const tempOutputVideoPath = inputVideoPath.replace(".mp4", "-temp.mp4");
  console.log(tempOutputVideoPath);
  const halfDuration = duration / 2;
  let link;
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .input(watermark)
      .complexFilter([
        {
          filter: "overlay",
          options: {
            x: "main_w-overlay_w-10",
            y: "main_h-overlay_h-10",
            enable: `between(t,0,${halfDuration})`,
          },
        },
      ])
      .output(tempOutputVideoPath)
      .on("end", async () => {
        console.log("Watermarking completed for position 1");
        link = await watermarkPosition2(
          outputVideoPath,
          tempOutputVideoPath,
          duration
        );
        resolve(link);
      })
      .run();    
  });
};

const watermarkPosition2 = async (
  outputVideoPath,
  tempOutputVideoPath,
  duration
) => {
  let link;
  return new Promise(async (resolve, reject) => {
    ffmpeg(tempOutputVideoPath)
      .input(watermark)
      .complexFilter([
        {
          filter: "overlay",
          options: {
            x: "10",
            y: "10",
            enable: `between(t,${duration / 2},${duration})`,
          },
        },
      ])
      .output(outputVideoPath)
      .on("end", async () => {
        console.log("Watermarking completed for position 2");
        deleteTempVideo(tempOutputVideoPath);
        link = await uploadVideo(outputVideoPath);
        resolve(link);
        deleteTempVideo(outputVideoPath);
      })
      .run();
  });
};

const deleteTempVideo = (videoPath) => {
  fs.unlink(videoPath, (err) => {
    if (err) {
      console.error("Error deleting temporary video:", err);
    } else {
      console.log("Temporary video deleted");
    }
  });
};

const getInputVideoLength = (inputVideoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      inputVideoPath,
      ["-show_entries", "format=duration"],
      (err, metadata) => {
        if (err) {
          console.error("Error getting video length:", err);
          reject(err);
        } else {
          const duration = parseFloat(metadata.format.duration);
          resolve(duration);
        }
      }
    );
  });
};

module.exports = {
  watermarkVideo,
};
// https://www.youtube.com/watch?v=kojaR6LBdzI&ab_channel=CodingwithAdo
