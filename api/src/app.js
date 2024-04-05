require("dotenv").config();

const express = require("express");
const path = require("path");
const shotstack = require("./handler/shotstack/lib/shotstack");
const edit = require("./handler/shotstack/lib/edit");
const multer = require("multer");

const VideoEncryptor = require("video-encryptor");
const videoEncryptor = new VideoEncryptor();


const { watermarkVideo } = require("./watermark");
const { uploadVideo } = require("./cloudinary");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + "../../../web")));

app.post("/watermark", async (req, res) => {
  try {
    const json = await edit.createJson(req.body);
    const render = await shotstack.submit(json);
    console.log("ok");

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

app.get("/watermark/:renderId", async (req, res) => {
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

/*
app.post("/encrypt", async (req, res) => {
  try {
    const encryptPath = path.join(__dirname, "../encrypt/");
    console.log(encryptPath);
    const decryptPath = path.join(__dirname, "../decrypt/");
    console.log(decryptPath);
    const videoPath = decryptPath + req.body.videoPath;
    const encryptionKey = req.body.encryptionKey;
    const outputPath = encryptPath + req.body.outputPath;

    const result = await videoEncryptor.encryptVideo(
      videoPath,
      encryptionKey,
      outputPath
    );

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send({ status: "success", message: result });
  } catch (err) {
    console.log(err);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(400).send({ status: "fail", message: "bad request", data: err });
  }
});

app.post("/decrypt", async (req, res) => {
  try {
    const encryptPath = path.join(__dirname, "../encrypt/");
    console.log(encryptPath);
    const decryptPath = path.join(__dirname, "../decrypt/");
    console.log(decryptPath);
    const encryptedVideo = encryptPath + req.body.encryptedVideo;
    console.log(encryptedVideo);
    const encryptionKey = req.body.encryptionKey;
    const outputPath = decryptPath + req.body.outputPath;

    const result = await videoEncryptor.decryptVideo(
      encryptedVideo,
      encryptionKey,
      outputPath
    );

    res.header("Access-Control-Allow-Origin", "*");
    res.status(200);
    res.send({ status: "success", message: "OK", data: result });
  } catch (err) {
    console.log(err);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(400);
    res.send({ status: "fail", message: "bad request", data: err });
  }
});

const LitJsSdkClient = require("@lit-protocol/lit-node-client-nodejs");
const LitJsSdk = require("lit-js-sdk");
const { ethers } = require("ethers");
const siwe = require("siwe");

async function authpSig() {
  // Initialize LitNodeClient
  const litNodeClient = new LitJsSdkClient.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: "cayenne",
  });
  await litNodeClient.connect();

  let nonce = litNodeClient.getLatestBlockhash();

  // Initialize the signer
  const wallet = new ethers.Wallet(
    "03e2d7915cc58f7dca153a43a7231c6ac8529a51ae0e74c2ddf496e4eb043ac3"
  );
  const address = await wallet.getAddress();

  // Craft the SIWE message
  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement.  You can put anything you want here.";

  // expiration time in ISO 8601 format.  This is 7 days in the future, calculated in milliseconds
  const expirationTime = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
  ).toISOString();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: address,
  };

  console.log("Done!");
  return authSig;
}

app.post("/create-key", async (req, res) => {
  try {
    const authSig = await authpSig();
    
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await litNodeClient.connect();

    const keyPair = await litNodeClient.executeJs({
      code: `
        const keyPair = Lit.Crypto.generateKeyPair();
        keyPair;
      `,
    });
    console.log("tạo khóa:", keyPair);
    res.status(200).json(keyPair);
  } catch (error) {
    console.error("Lỗi khi tạo khóa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

*/

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Set filename to the original name of the file
  }
});

// Create multer instance with the configured storage
const upload = multer({ storage: storage });


app.post("/uploadVideo", async (req, res) => {
  try {
    // Check if file is uploaded
    // if (!req.file) {
    //   return res.status(400).send('No file uploaded');
    // }

    // File uploaded successfully, proceed with watermarking
    const uploadedFile = 'suburbia-aerial.mp4';
    const outputVideoPath = uploadedFile.replace('.mp4', '-watermarked.mp4');

    // Wait for watermarking to complete
    const videoLink = await watermarkVideo(uploadedFile, outputVideoPath)
      .then((videoLink) => {
        res.send({ status: "success", message: "OK", videoLink: videoLink });
      });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('An error occurred while uploading the video');
  }
});

app.listen(3000, () => {
  console.log(
    "Server running...\n\nOpen http://localhost:3000 in your browser\n"
  );
});

// https://cloudinary.com/blog/video_uploads_with_cloudinary