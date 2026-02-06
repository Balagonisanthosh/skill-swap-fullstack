const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillswap/mentorRequest_video",
   resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"],
  },
});
const uploadVideo = multer({ storage: videoStorage });

module.exports = uploadVideo;
