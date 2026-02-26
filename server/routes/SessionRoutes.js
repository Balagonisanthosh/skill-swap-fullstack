const express = require("express");
const router = express.Router();

const {
  createSession,
  getMySessions,
  completeSession,
  cancelSession,
} = require("../controllers/session-Controller");

const protect = require("../middleware/authMiddleWare");

router.post("/", protect, createSession);

router.get("/", protect, getMySessions);

router.patch("/:id/complete", protect, completeSession);

router.patch("/:id/cancel", protect, cancelSession);

module.exports = router;