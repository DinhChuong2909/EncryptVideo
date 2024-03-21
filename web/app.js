var apiUrl = "http://localhost:3000/";
var apiEndpoint = apiUrl + "upload";
var probeEndpoint = "https://api.shotstack.io/stage/probe/";
var s3Bucket =
  "https://shotstack-demo-storage.s3-ap-southeast-2.amazonaws.com/";

const pollVideoStatus = async (uuid) => {
  $.get(apiEndpoint + "/" + uuid, function (response) {
    if (
      !(response.data.status === "done" || response.data.status === "failed")
    ) {
      setTimeout(() => {
        console.log(response.data.status + "...");
        pollVideoStatus(uuid);
      }, 3000);
    } else if (response.data.status === "failed") {
      console.error("Failed with the following error: " + response.data.error);
    } else {
      console.log("Video is ready: " + response.data.url);
    }
  });
};

function getSelectedVideoFile() {
  const video = document.getElementById('videoEl');
  const upload = document.getElementById('video-upload');
  console.log(video.src)
}

function submitVideoEdit() {
  var formData = {
    video:
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/suburbia-aerial.mp4",
    watermark:
      "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/logos/real-estate-black.png",
    position: "bottomRight",
  };

  $.ajax({
    type: "POST",
    url: apiEndpoint,
    data: JSON.stringify(formData),
    dataType: "json",
    crossDomain: true,
    contentType: "application/json",
  })
    .done(function (response) {
      if (response.status !== "success") {
        $("#submit-video").prop("disabled", false);
      } else {
        pollVideoStatus(response.data.response.id);
      }
      console.log(response);
    })
    .fail(function (error) {
      // console.error(error);
      console.log("error");
      $("#submit-video").prop("disabled", false);
    });
}

const getFileName = (url) => {
  return url.split("/").pop();
}

function submitVideoEncrypt() {

  var formData = {
    videoPath: "suburbia-aerial.mp4",
    encryptionKey: "abbas1234",
    outputPath: "suburbia-aerial.mp4"
  };

  $.ajax({
    type: "POST",
    url: apiUrl + "encrypt",
    data: JSON.stringify(formData),
    dataType: "json",
    crossDomain: true,
    contentType: "application/json",
  })
    .done(function (response) {
      if (response.status !== "success") {
        $("#submit-video").prop("disabled", false);
      } 
      console.log(response);
    })
    .fail(function (error) {
      // console.error(error);
      console.log("error");
      $("#submit-video").prop("disabled", false);
    });
}


function submitVideoDecrypt() {
  var formData = {
    encryptedVideo: "suburbia-aerial.encrypted",
    encryptionKey: "abbas1234",
    outputPath: "suburbia-aerial.mp4",
  };

  $.ajax({
    type: "POST",
    url: apiUrl + "decrypt",
    data: JSON.stringify(formData),
    dataType: "json",
    crossDomain: true,
    contentType: "application/json",
  })
    .done(function (response) {
      if (response.status !== "success") {
        $("#submit-video").prop("disabled", false);
      }
      console.log(response);
    })
    .fail(function (error) {
      console.log("error");
      $("#submit-video").prop("disabled", false);
    });
}

$(document).ready(function () {
  $("form").submit(function (event) {
    submitVideoDecrypt();
    event.preventDefault();
  });
});
