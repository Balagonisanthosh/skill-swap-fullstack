const Session = require("../models/Session");
const Mentor = require("../models/Mentor");
const ConnectionRequest = require("../models/ConnectionRequest");


const createSession = async (req, res) => {
  try {
    const mentorUserId = req.user.id;
    const { menteeId, scheduledAt, duration, meetingLink } = req.body;

    const mentor = await Mentor.findOne({ userId: mentorUserId });
    if (!mentor) {
      return res.status(403).json({ message: "Only mentors can create sessions" });
    }

    const connection = await ConnectionRequest.findOne({
      userId: menteeId,
      mentorId: mentor._id,
      status: "accepted",
    });

    if (!connection) {
      return res.status(403).json({
        message: "Connection not accepted with this user",
      });
    }

    // Create session
    const session = await Session.create({
      mentor: mentorUserId,
      mentee: menteeId,
      scheduledAt,
      duration,
      meetingLink,
    });

    return res.status(201).json({
      success: true,
      session,
    });

  } catch (error) {
    console.error("CREATE SESSION ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Mentor already has a session at this time",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};


const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      $or: [{ mentor: userId }, { mentee: userId }],
    })
      .populate("mentor", "username profileImage")
      .populate("mentee", "username profileImage")
      .sort({ scheduledAt: -1 });

    return res.status(200).json({
      success: true,
      sessions,
    });

  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const completeSession = async (req, res) => {
  try {
    const mentorUserId = req.user.id;
    const { id } = req.params;

    const session = await Session.findOne({
      _id: id,
      mentor: mentorUserId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found or unauthorized",
      });
    }

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      session,
    });

  } catch (error) {
    console.error("COMPLETE SESSION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const cancelSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await Session.findOne({
      _id: id,
      $or: [{ mentor: userId }, { mentee: userId }],
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "cancelled";
    await session.save();

    return res.status(200).json({
      success: true,
      session,
    });

  } catch (error) {
    console.error("CANCEL SESSION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createSession,
  getMySessions,
  completeSession,
  cancelSession,
};