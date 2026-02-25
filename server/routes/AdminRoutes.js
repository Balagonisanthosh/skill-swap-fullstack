const express = require("express");
const {
  FetchMentors,
  approveMentorRequest,
  rejectMentorRequest,
  getAdminDashboardStats,
  getTotalUsersList,
  getTotalMentorList,
  deleteMentorByID,
  deleteUserByID
} = require("../controllers/admin-Controller");

const authMiddleWare = require("../middleware/authMiddleWare");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/mentorsRequest", authMiddleWare, adminMiddleware, FetchMentors);

router.put("/mentor-requests/:id/approve",
  authMiddleWare,
  adminMiddleware,
  approveMentorRequest
);

router.put("/mentor-requests/:id/reject",
  authMiddleWare,
  adminMiddleware,
  rejectMentorRequest
);

router.get("/dashboard",
  authMiddleWare,
  adminMiddleware,
  getAdminDashboardStats
);

router.get("/getusersList",
  authMiddleWare,
  adminMiddleware,
  getTotalUsersList
);

router.get("/getTotalMentorsList",
  authMiddleWare,
  adminMiddleware,
  getTotalMentorList
);

router.patch("/deleteMentor/:id",
  authMiddleWare,
  adminMiddleware,
  deleteMentorByID
);

router.delete("/deleteUser/:id",
  authMiddleWare,
  adminMiddleware,
  deleteUserByID
);

module.exports = router;