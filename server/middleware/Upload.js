const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillswap/profile_images",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  },
});

const upload = multer({ storage });

module.exports = upload;
