const transporter  = require("../config/EmailTransporter");
const Mentor = require("../models/Mentor");
const User = require("../models/User");
const MentorRequest = require("../models/mentorRequest");
require("dotenv").config();



const getAdminDashboardStats = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        approvedMentors,
        pendingMentors,
        rejectedMentors,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard stats",
    });
  }
};

const getTotalUsersList = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      total: users.length,
      users,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "fained to fetch internal server error"
    })

  }
}

const getTotalMentorList = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password").sort({ createdAt: -1 });
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      total: mentors.length,
      mentors,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "fained to fetch internal server error"
    })

  }
}

const FetchMentors = async (req, res) => {
  const mentorsList = await MentorRequest.find({status: { $ne: "removed" }})
    .populate("userId", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({ mentorsList });
};

const approveMentorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find mentor request
    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 2️⃣ Update mentor request status
    mentorRequest.status = "approved";
    mentorRequest.rejectionReason = null;
    await mentorRequest.save();

    // 3️⃣ Create / update mentor profile
    await Mentor.findOneAndUpdate(
      { userId: mentorRequest.userId },
      { isActive: true },
      { upsert: true }
    );

    // 4️⃣ Update user role
    const user = await User.findById(mentorRequest.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "mentor";
    user.mentorStatus = "approved";
    await user.save();

    // 5️⃣ Send approval email (safe)
    try {
      await transporter.sendMail({
        from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "🎉 You’re Approved as a Mentor!",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Congratulations ${user.username}! 🎉</h2>
            <p>Your mentor request has been <strong>approved</strong>.</p>
            <p>You are now officially a mentor on <strong>SkillSwap</strong>.</p>
            <p>You can start connecting with learners and sharing your skills.</p>
            <br />
            <p>Welcome aboard 🚀</p>
            <p><strong>— SkillSwap Team</strong></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("MENTOR APPROVAL EMAIL ERROR:", emailErr.message);
    }

    // 6️⃣ Response
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

    // 1️⃣ Validate reason
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        message: "Valid rejection reason required",
      });
    }

    // 2️⃣ Find mentor request
    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 3️⃣ Update mentor request
    mentorRequest.status = "rejected";
    mentorRequest.rejectionReason = reason;
    await mentorRequest.save();

    // 4️⃣ Update user
    const user = await User.findById(mentorRequest.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "user";
    user.mentorStatus = "rejected";
    await user.save();

    // 5️⃣ Send rejection email (safe)
    try {
      await transporter.sendMail({
        from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Mentor Request Update ❌",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hello ${user.username},</h2>
            <p>Thank you for applying to become a mentor on <strong>SkillSwap</strong>.</p>
            <p>After reviewing your request, we regret to inform you that it has been <strong>rejected</strong>.</p>

            <p><strong>Reason:</strong></p>
            <blockquote style="background:#f8f8f8;padding:10px;border-left:4px solid #f44336;">
              ${reason}
            </blockquote>

            <p>You may improve your profile and apply again in the future.</p>
            <br />
            <p>We appreciate your interest 🙏</p>
            <p><strong>— SkillSwap Team</strong></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("MENTOR REJECTION EMAIL ERROR:", emailErr.message);
    }

    // 6️⃣ Response
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

    // 1️⃣ Update user role
    const user = await User.findByIdAndUpdate(
      id,
      {
        role: "user",
        mentorStatus: "none",
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "No user found with this ID",
      });
    }

    // 2️⃣ Update mentor request status
    const mentorRequest = await MentorRequest.findOneAndUpdate(
      { userId: id },
      { status: "removed" },
      { new: true }
    );

    if (!mentorRequest) {
      return res.status(404).json({
        message: "No mentor request found for this user",
      });
    }

    // 3️⃣ Delete mentor profile
    const mentor = await Mentor.findOneAndDelete({ userId: id });
    if (!mentor) {
      return res.status(404).json({
        message: "No mentor found for this user",
      });
    }

    // 4️⃣ Send mentor removal email (safe)
    try {
      await transporter.sendMail({
        from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Mentor Role Removed ❗",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hello ${user.username},</h2>
            <p>We would like to inform you that your <strong>mentor role</strong> on SkillSwap has been removed by the admin.</p>
            <p>You are now reverted back to a regular user account.</p>
            <p>If you believe this was a mistake, please contact our support team.</p>
            <br />
            <p>Regards,</p>
            <p><strong>— SkillSwap Team</strong></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("MENTOR DELETE EMAIL ERROR:", emailErr.message);
    }

    // 5️⃣ Response
    return res.status(200).json({
      success: true,
      message: "Mentor deleted successfully and role updated",
      user,
    });
  } catch (error) {
    console.error("DELETE MENTOR ERROR:", error);
    return res.status(500).json({
      message: "Failed to remove mentor",
      error: error.message,
    });
  }
};


const deleteUserByID = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2️⃣ Delete mentor request (if exists)
    await MentorRequest.findOneAndDelete({ userId: id });

    // 3️⃣ Delete mentor profile (if exists)
    await Mentor.findOneAndDelete({ userId: id });

    // 4️⃣ Delete user
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User and all related mentor data deleted successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};



module.exports = {
  FetchMentors,
  approveMentorRequest,
  rejectMentorRequest, getAdminDashboardStats, getTotalUsersList, getTotalMentorList, deleteMentorByID, deleteUserByID
};
