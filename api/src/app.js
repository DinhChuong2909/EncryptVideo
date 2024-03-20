require("dotenv").config();

const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const shotstack = require("./handler/shotstack/lib/shotstack");
const edit = require("./handler/shotstack/lib/edit");
const upload = require("./handler/upload/lib/upload");
const multer = require('multer');

const VideoEncryptor = require("video-encryptor");
const videoEncryptor = new VideoEncryptor();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + "../../../web")));

app.post("/upload", async (req, res) => {
  try {
    const json = await edit.createJson(req.body);
    console.log("ok");
    const render = await shotstack.submit(json);

    res.header("Access-Control-Allow-Origin", "*");
    res.status(201);
    res.send({ status: "success", message: "OK", data: render });
  } catch (err) {
    // console.log(err);
    console.log("fail");
    res.header("Access-Control-Allow-Origin", "*");
    res.status(400);
    res.send({ status: "fail", message: "bad request", data: err });
  }
});

app.get("/upload/:renderId", async (req, res) => {
  try {
    const status = await shotstack.status(req.params.renderId);
    console.log("renderID ok");
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200);
    res.send({ status: "success", message: "OK", data: status });
  } catch (err) {
    // console.log(err);
    console.log("renderID fail");
    res.header("Access-Control-Allow-Origin", "*");
    res.status(400);
    res.send({ status: "fail", message: "bad request", data: err });
  }
});

// app.post('/upload/sign', async (req, res) => {
//     try {
//         const data = req.body;
//         const presignedPostData = await upload.createPresignedPost(uniqid() + '-' + data.name, data.type);

//         res.header("Access-Control-Allow-Origin", "*");
//         res.status(200);
//         res.send({ status: 'success', message: 'OK', data: presignedPostData });
//     } catch (err) {
//         console.log(err);
//         res.header("Access-Control-Allow-Origin", "*");
//         res.status(400);
//         res.send({ status: 'fail', message: 'bad request', data: err.message });
//     }
// });


const storage = multer.memoryStorage();

const multerUpload = multer({storage: storage});

app.post("/encrypt", async (req, res) => {
  try {
      const videoPath = req.body.videoPath; 
      const encryptionKey = req.body.encryptionKey;
      const outputPath = req.body.outputPath;

      const result = await videoEncryptor.encryptVideo(videoPath, encryptionKey, outputPath);
      
      res.header("Access-Control-Allow-Origin", "*");
      res.status(200).send({ status: "success", message: result });
  } catch (err) {
      console.log(err);
      res.header("Access-Control-Allow-Origin", "*");
      res.status(400).send({ status: "fail", message: "bad request", data: err });
  }
});

function decryptedVideo(encryptedFilePath, key, outputPath) {
    key = "abbas1234";
    outputPath = "decrypted-video";

    videoEncryptor.decryptVideo(encryptedFilePath, key, outputPath);
}

app.post("/decrypt", async (req, res) => {
    try {
        const encryptedVideo = req.body.encryptedVideo;
        const encryptionKey = req.body.encryptionKey;
        const outputPath = req.body.outputPath;

        const result = await videoEncryptor.decryptVideo(encryptedVideo, encryptionKey, outputPath);
        
        res.header("Access-Control-Allow-Origin", "*");
        res.status(200);
        res.send({ status: "success", message: "OK" , data: result});
    } catch (err) {
        console.log(err);
        res.header("Access-Control-Allow-Origin", "*");
        res.status(400);
        res.send({ status: "fail", message: "bad request", data: err });
    }
});


app.listen(3000, () =>
  console.log(
    "Server running...\n\nOpen http://localhost:3000 in your browser\n"
  )
);
