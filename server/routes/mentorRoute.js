const express=require("express");
const authMiddleWare = require("../middleware/authMiddleWare");
const { getMyMentorProfile, createMentorProfile } = require("../controllers/mentor-Controller");
const router = express.Router();

router.get('/mentor/me',authMiddleWare,getMyMentorProfile);
router.post("/mentor", authMiddleWare, createMentorProfile);

module.exports=router;