const Mentor = require("../models/Mentor");
const User = require("../models/User");
const MentorRequest = require("../models/mentorRequest");


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
  const { id } = req.params;

  const mentorRequest = await MentorRequest.findById(id);
  if (!mentorRequest)
    return res.status(404).json({ message: "Request not found" });

  mentorRequest.status = "approved";
  mentorRequest.rejectionReason = null; 
  await mentorRequest.save();


  await Mentor.findOneAndUpdate(
      { userId: mentorRequest.userId },
    );

  const user = await User.findById(mentorRequest.userId);
  user.role = "mentor";
  user.mentorStatus = "approved";
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mentor approved",
  });
};

const rejectMentorRequest = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ message: "Valid reason required" });
  }

  const mentorRequest = await MentorRequest.findById(id);
  if (!mentorRequest)
    return res.status(404).json({ message: "Request not found" });

  mentorRequest.status = "rejected";
  mentorRequest.rejectionReason = reason;
  await mentorRequest.save();

  const user = await User.findById(mentorRequest.userId);
  user.role = "user";
  user.mentorStatus = "rejected";
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mentor request rejected",
  });
};

const deleteMentorByID = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, {
      role: "user",
      mentorStatus: "none"
    }, {
      new: true
    });

    if (!user) {
      return res.status(404).json({
        message: "no user find by these id"
      })
    }
    const mentorRequest = await MentorRequest.findOneAndUpdate({ userId: id },
      { status: "removed" },
      { new: true });

    if (!mentorRequest) {
      return res.status(404).json({
        message: "No mentor request found for this user",
      });
    }
    const mentor = await Mentor.findOneAndDelete({ userId: id });
    if (!mentor) {
      return res.status(404).json({
        message: "no mentor find by these id"
      })
    }

    return res.status(200).json({
      message: "mentor deteled successfully and upadted the role",
      user,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove mentor",
      error: error.message,
    });
  }
}

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
