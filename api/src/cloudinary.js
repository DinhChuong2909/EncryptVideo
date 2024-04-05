const cloudnary = require("cloudinary").v2;

cloudnary.config({
  cloud_name: "dlrgntcek",
  api_key: "875238732252433",
  api_secret: "_rGpYE3lfWRkHRG_61qFZDF_c_s",
});

const otps = {
  overwrite: true,
  invalidate: true,
  resource_type: "video",
};

async function uploadVideo(file) {
  return new Promise(async (resolve, reject) => {
    await cloudnary.uploader.upload_large(file, otps, (error, result) => {
      if (result && result.secure_url) {
        resolve(result.secure_url);
      }
      if (error) {
        console.log('Error', error);
        reject(error);
      }
    });
  });
}

module.exports = {
  uploadVideo,
};
