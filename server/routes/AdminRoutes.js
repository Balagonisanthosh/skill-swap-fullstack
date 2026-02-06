const express=require("express");
const { FetchMentors, approveMentorRequest, rejectMentorRequest, getAdminDashboardStats, getTotalUsersList, getTotalMentorList, deleteMentorByID, deleteUserByID } = require("../controllers/admin-Controller");
const authMiddleWare = require("../middleware/authMiddleWare");
const router=express.Router();

router.get("/mentorsRequest",FetchMentors);
router.put("/mentor-requests/:id/approve",authMiddleWare, approveMentorRequest);
router.put("/mentor-requests/:id/reject",authMiddleWare, rejectMentorRequest);
router.get("/dashboard",authMiddleWare,getAdminDashboardStats);
router.get("/getusersList",authMiddleWare,getTotalUsersList);
router.get("/getTotalMentorsList",authMiddleWare,getTotalMentorList);
router.patch("/deleteMentor/:id",authMiddleWare,deleteMentorByID);
router.delete("/deleteUser/:id",authMiddleWare,deleteUserByID);


module.exports=router;