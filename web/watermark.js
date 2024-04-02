const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

// Input video path (replace with your actual video file)
const inputVideoPath = 'suburbia-aerial.mp4';

// Watermark image path (replace with your actual watermark image)
const watermarkImagePath = 'watermark.png';

// Output video path (where the watermarked video will be saved)
const outputVideoPath = 'output.mp4';
const tempOutputVideoPath = 'output_position1.mp4';

const watermarkPosition1 = async (inputVideoPath, outputVideoPath) => {
    const duration = await getInputVideoLength(inputVideoPath);
    const halfDuration = duration / 2;

    await ffmpeg(inputVideoPath)
        .input(watermarkImagePath)
        .complexFilter([
            {
                filter: 'overlay',
                options: {
                    x: 'main_w-overlay_w-10',
                    y: 'main_h-overlay_h-10',
                    enable: `between(t,0,${halfDuration})`
                }
            }
        ])
        .output(tempOutputVideoPath) 
        .on('end', () => {
            console.log('Watermarking completed for position 1');
            watermarkPosition2(outputVideoPath, duration);
        })
        .run();
};

const watermarkPosition2 = async (outputVideoPath, duration) => {
    await ffmpeg(tempOutputVideoPath)
        .input(watermarkImagePath)
        .complexFilter([
            {
                filter: 'overlay',
                options: {
                    x: '10',
                    y: '10',
                    enable: `between(t,${duration / 2},${duration})`
                }
            }
        ])
        .output(outputVideoPath)
        .on('end', () => {
            console.log('Watermarking completed for position 2');
            deleteTempVideo();
        })
        .run();
};

const deleteTempVideo = () => {
    fs.unlink(tempOutputVideoPath, (err) => {
        if (err) {
            console.error('Error deleting temporary video:', err);
        } else {
            console.log('Temporary video deleted');
        }
    });
};

const getInputVideoLength = (inputVideoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputVideoPath, ['-show_entries', 'format=duration'], (err, metadata) => {
            if (err) {
                console.error('Error getting video length:', err);
                reject(err);
            } else {
                const duration = parseFloat(metadata.format.duration);
                resolve(duration);
            }
        });
    });
};

(async () => {
    try {
        await watermarkPosition1(inputVideoPath, outputVideoPath);
    } catch (error) {
        console.error('Error watermarking video:', error);
    }
})();
