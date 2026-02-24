const transporter = require("../config/EmailTransporter");
const Mentor = require("../models/Mentor");
const User = require("../models/User");
const MentorRequest = require("../models/mentorRequest");
const { redisClient } = require("../config/redis");
require("dotenv").config();

const getAdminDashboardStats = async (req, res) => {
  try {
    const cachedData = await redisClient.get("admin:dashboard");

    if (cachedData) {
      console.log("📦 Serving dashboard from Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("🗄️ Serving dashboard from MongoDB");

    const totalUsers = await User.countDocuments();

    const mentorStats = await MentorRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const approvedMentors =
      mentorStats.find(item => item._id === "approved")?.count || 0;

    const pendingMentors =
      mentorStats.find(item => item._id === "pending")?.count || 0;

    const rejectedMentors =
      mentorStats.find(item => item._id === "rejected")?.count || 0;

    const responseData = {
      success: true,
      data: {
        totalUsers,
        approvedMentors,
        pendingMentors,
        rejectedMentors,
      },
    };

    await redisClient.setEx(
      "admin:dashboard",
      300,
      JSON.stringify(responseData)
    );

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard stats",
    });
  }
};


const getTotalUsersList = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: users.length,
      users,
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


const getTotalMentorList = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: mentors.length,
      mentors,
    });

  } catch (error) {
    console.error("GET MENTORS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentors",
    });
  }
};


const FetchMentors = async (req, res) => {
  try {
    const mentorsList = await MentorRequest.find({
      status: { $ne: "removed" },
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ mentorsList });

  } catch (error) {
    console.error("FETCH MENTORS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch mentor requests" });
  }
};


const approveMentorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest)
      return res.status(404).json({ message: "Request not found" });

    mentorRequest.status = "approved";
    mentorRequest.rejectionReason = null;
    await mentorRequest.save();

    await Mentor.findOneAndUpdate(
      { userId: mentorRequest.userId },
      { isActive: true },
      { upsert: true }
    );

    const user = await User.findById(mentorRequest.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = "mentor";
    user.mentorStatus = "approved";
    await user.save();
    transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🎉 Your Mentor Request Has Been Approved!",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Congratulations ${user.username} 🎉</h2>
          <p>Your mentor request has been <b>approved</b>.</p>
          <p>You can now log in and start mentoring.</p>
          <br/>
          <p>Best Regards,<br/>Team</p>
        </div>
      `,
    }).catch(err => {
      console.error("Email sending failed:", err);
    });

    await redisClient.del("admin:dashboard");

    return res.status(200).json({
      success: true,
      message: "Mentor approved successfully",
    });

  } catch (error) {
    console.error("APPROVE MENTOR ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const rejectMentorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5)
      return res.status(400).json({
        message: "Valid rejection reason required",
      });

    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest)
      return res.status(404).json({ message: "Request not found" });

    mentorRequest.status = "rejected";
    mentorRequest.rejectionReason = reason;
    await mentorRequest.save();

    const user = await User.findById(mentorRequest.userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = "user";
    user.mentorStatus = "rejected";
    await user.save();

    transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Mentor Application Update",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hello ${user.username},</h2>

          <p>We appreciate your interest in becoming a mentor.</p>

          <p>
            After reviewing your application, we regret to inform you that it has been
            <strong style="color:red;">rejected</strong>.
          </p>

          <div style="background:#f8f8f8; padding:15px; border-radius:6px; margin-top:10px;">
            <strong>Reason:</strong>
            <p style="margin-top:5px;">${reason}</p>
          </div>

          <p style="margin-top:15px;">
            You’re welcome to improve your profile and apply again in the future.
          </p>

          <br/>
          <p>Best Regards,<br/>Team</p>
        </div>
      `,
    }).catch(err => {
      console.error("Rejection email failed:", err);
    });

    // 🔥 Clear Redis cache
    await redisClient.del("admin:dashboard");

    return res.status(200).json({
      success: true,
      message: "Mentor request rejected successfully",
    });

  } catch (error) {
    console.error("REJECT MENTOR ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


const deleteMentorByID = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { role: "user", mentorStatus: "none" },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    await MentorRequest.findOneAndUpdate(
      { userId: id },
      { status: "removed" }
    );

    await Mentor.findOneAndDelete({ userId: id });

    transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Mentor Role Update",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hello ${user.username},</h2>

          <p>
            We would like to inform you that your <strong>mentor access has been removed</strong>.
          </p>

          <p>
            If you believe this was done in error or would like to reapply,
            please contact support or submit a new mentor request.
          </p>

          <br/>
          <p>Best Regards,<br/>Team</p>
        </div>
      `,
    }).catch(err => {
      console.error("Mentor removal email failed:", err);
    });

    await redisClient.del("admin:dashboard");

    return res.status(200).json({
      success: true,
      message: "Mentor removed successfully",
    });

  } catch (error) {
    console.error("DELETE MENTOR ERROR:", error);
    return res.status(500).json({
      message: "Failed to remove mentor",
    });
  }
};


const deleteUserByID = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Account Deletion Notice",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Hello ${user.username},</h2>

          <p>
            We regret to inform you that your account has been
            <strong>deleted by the administrator</strong>.
          </p>

          <p>
            If you believe this action was taken in error,
            please contact support for further clarification.
          </p>

          <br/>
          <p>Best Regards,<br/>Team</p>
        </div>
      `,
    }).catch(err => {
      console.error("User deletion email failed:", err);
    });

    await MentorRequest.findOneAndDelete({ userId: id });
    await Mentor.findOneAndDelete({ userId: id });
    await User.findByIdAndDelete(id);

    await redisClient.del("admin:dashboard");

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  FetchMentors,
  approveMentorRequest,
  rejectMentorRequest,
  getAdminDashboardStats,
  getTotalUsersList,
  getTotalMentorList,
  deleteMentorByID,
  deleteUserByID,
};