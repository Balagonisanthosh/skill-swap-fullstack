const express = require("express");
const router = express.Router();
const upload = require("../middleware/Upload");
const { register, login, getProfile, updateProfile, applyMentorRequest, getMyMentorRequestStatus, fetchMentors, refreshToken, logout, sendConnectionRequest, getUserConnectionRequests, getMentorConnectionRequests, respondToConnectionRequest } = require("../controllers/auth-Controller");
const authMiddleware = require("../middleware/authMiddleWare");
const uploadVideo = require("../middleware/uploadVideo");




router.post("/register", upload.single("photo"), register);

router.post("/login", login);
 

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, upload.single("photo"), updateProfile);
router.post('/user/applyMentor',authMiddleware,uploadVideo.single("uploadVideo"), applyMentorRequest);

router.get("/mentor-request/user", authMiddleware, getMyMentorRequestStatus);
router.get("/mentorsList",authMiddleware,fetchMentors);
router.post("/refresh", refreshToken);
router.post("/connectionRequest",authMiddleware,sendConnectionRequest);
router.get("/connectionRequest/user",authMiddleware,getUserConnectionRequests);
router.get("/connectionRequest/mentor",authMiddleware,getMentorConnectionRequests);
router.patch("/connectionRequest/:id",authMiddleware,respondToConnectionRequest);

router.post("/logout", logout);

module.exports = router;
