const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MentorRequest = require("../models/mentorRequest");
const Mentor = require("../models/Mentor");
const { generateAccessToken, generateRefreshToken } = require("../utils/Tokens");
const ConnectionRequest = require("../models/ConnectionRequest");
const transporter = require("../config/EmailTransporter");
require("dotenv").config();


// ===================== REGISTER =====================
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      skillsYouKnown,
      skillsYouWantToLearn,
    } = req.body;

    // ✅ Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Safe parsing for skills
    let parsedSkillsKnown = [];
    let parsedSkillsWant = [];

    if (skillsYouKnown) {
      parsedSkillsKnown = Array.isArray(skillsYouKnown)
        ? skillsYouKnown
        : JSON.parse(skillsYouKnown);
    }

    if (skillsYouWantToLearn) {
      parsedSkillsWant = Array.isArray(skillsYouWantToLearn)
        ? skillsYouWantToLearn
        : JSON.parse(skillsYouWantToLearn);
    }

    // ✅ Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      skillsYouKnown: parsedSkillsKnown,
      skillsYouWantToLearn: parsedSkillsWant,
      profileImage: req.file ? req.file.path : null,
      role: "user",
      mentorStatus: "none",
    });

    // ✅ Send welcome email (DO NOT BLOCK REGISTRATION)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to SkillSwap 🎉",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome, ${username} 👋</h2>
        <p>Your SkillSwap account has been created successfully.</p>
        <p>You can now start learning and sharing skills.</p>
        <br />
        <p>Happy Skill Swapping 🚀</p>
        <p><strong>— SkillSwap Team</strong></p>
      </div>
    `,
      });
    } catch (err) {
      console.error("EMAIL ERROR:", err.message);
    }


    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ===================== LOGIN =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 🔑 Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🔐 Hash refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // 🍪 Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",   // ✅ MUST be lax for localhost cross-origin
      secure: false,    // ✅ MUST be false on http
      path: "/",        // ✅ important
    });

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        skillsYouKnown: user.skillsYouKnown,
        skillsYouWantToLearn: user.skillsYouWantToLearn,
        role: user.role,
        mentorStatus: user.mentorStatus,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===================== GET PROFILE =====================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ===================== UPDATE PROFILE =====================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.username) user.username = req.body.username;

    if (req.body.skillsYouKnown) {
      user.skillsYouKnown = Array.isArray(req.body.skillsYouKnown)
        ? req.body.skillsYouKnown
        : JSON.parse(req.body.skillsYouKnown);
    }

    if (req.body.skillsYouWantToLearn) {
      user.skillsYouWantToLearn = Array.isArray(req.body.skillsYouWantToLearn)
        ? req.body.skillsYouWantToLearn
        : JSON.parse(req.body.skillsYouWantToLearn);
    }

    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ===================== APPLY / RE-APPLY MENTOR REQUEST =====================
const applyMentorRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { linkedInURL } = req.body;

    // 1️⃣ Validate input
    if (!linkedInURL || !req.file) {
      return res.status(400).json({
        message: "LinkedIn URL and video are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Block if already mentor
    if (user.role === "mentor") {
      return res.status(400).json({ message: "Already a mentor" });
    }

    // 4️⃣ Check existing mentor request
    let mentorRequest = await MentorRequest.findOne({ userId });

    if (mentorRequest) {
      if (mentorRequest.status === "pending") {
        return res.status(400).json({
          message: "Mentor request already pending",
        });
      }

      // Re-apply after rejection
      mentorRequest.status = "pending";
      mentorRequest.rejectionReason = null;
      mentorRequest.uploadVideo = req.file.path;
      mentorRequest.linkedInURL = linkedInURL;
      await mentorRequest.save();
    } else {
      mentorRequest = await MentorRequest.create({
        userId,
        linkedInURL,
        uploadVideo: req.file.path,
        status: "pending",
      });
    }

    // 5️⃣ Update user mentor status
    user.mentorStatus = "pending";
    await user.save();

    // 6️⃣ Send confirmation email (DO NOT BLOCK REQUEST)
    try {
      await transporter.sendMail({
        from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Mentor Request Submitted 🚀",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Mentor Request Received</h2>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>Your mentor request has been submitted successfully.</p>
            <p>Our team will review your profile and notify you once a decision is made.</p>
            <br />
            <p>Thank you for your patience 🙌</p>
            <p><strong>— SkillSwap Team</strong></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("MENTOR REQUEST EMAIL ERROR:", emailErr.message);
    }

    // 7️⃣ Final response
    return res.status(200).json({
      success: true,
      message: "Mentor request submitted successfully",
    });

  } catch (error) {
    console.error("MENTOR REQUEST ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



// ===================== GET MY MENTOR REQUEST STATUS =====================
const getMyMentorRequestStatus = async (req, res) => {
  try {
    const mentorRequest = await MentorRequest.findOne({
      userId: req.user.id,
    });

    if (!mentorRequest) {
      return res.status(200).json({ request: null });
    }

    return res.status(200).json({
      request: {
        status: mentorRequest.status,
        rejectionReason: mentorRequest.rejectionReason,
        createdAt: mentorRequest.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchMentors = async (req, res) => {
  try {
    const userId = req.user.id;

    const mentors = await Mentor.find({
      isActive: true,
      userId: { $ne: userId }, // 🚫 exclude current logged-in user
    })
      .populate("userId", "username email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      mentors,
    });
  } catch (error) {
    console.error("FETCH MENTORS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentors",
    });
  }
};


const refreshToken = async (req, res) => {
  try {
    // 1️⃣ Get refresh token from cookie
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      return res.status(401).json({
        message: "No refresh token provided",
      });
    }

    // 2️⃣ Verify refresh token JWT
    const decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 3️⃣ Find user in DB
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    // 4️⃣ Compare hashed refresh token
    const isValid = await bcrypt.compare(
      refreshTokenFromCookie,
      user.refreshToken
    );

    if (!isValid) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    // 5️⃣ Rotate tokens (IMPORTANT)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    // 6️⃣ Send new refresh token as HttpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    // 7️⃣ Send new access token
    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return res.status(403).json({
      message: "Refresh token expired or invalid",
    });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mentorId, message } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.isActive) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // ✅ BLOCK DUPLICATES (any status)
    const existingRequest = await ConnectionRequest.findOne({
      userId,
      mentorId,
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent a connection request to this mentor",
      });
    }

    const request = await ConnectionRequest.create({
      userId,
      mentorId,
      message,
      status: "pending",
    });

    return res.status(201).json({
      message: "Connection request sent successfully",
      request,
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ConnectionRequest.find({ userId })
      .populate("mentorId")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Fetch user connection requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMentorConnectionRequests = async (req, res) => {
  try {
    const mentorUserId = req.user.id;

    const mentor = await Mentor.findOne({ userId: mentorUserId });

    if (!mentor) {
      return res.status(200).json({ requests: [] });
    }

    const requests = await ConnectionRequest.find({
      mentorId: mentor._id,
      status: "pending",
    })
      .populate("userId", "username email profileImage skillsYouKnown")
      .sort({ createdAt: -1 });
    const connectionsCount = await ConnectionRequest.countDocuments({
      mentorId: mentor._id,
      status: "accepted",
    });

    res.status(200).json({ requests, connectionsCount });
  } catch (error) {
    console.error("Fetch mentor connection requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= ACCEPT / REJECT CONNECTION REQUEST =================
const respondToConnectionRequest = async (req, res) => {
  try {
    const mentorUserId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // accepted | rejected

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // find mentor profile
    const mentor = await Mentor.findOne({ userId: mentorUserId });
    if (!mentor) {
      return res.status(403).json({ message: "Not a mentor" });
    }

    // find pending request for this mentor
    const request = await ConnectionRequest.findOne({
      _id: id,
      mentorId: mentor._id,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Connection request ${status}`,
      request,
    });
  } catch (error) {
    console.error("Respond connection request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Generate JWT reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    // 3️⃣ Reset link (frontend)
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    // 4️⃣ Send email (safe)
    try {
      await transporter.sendMail({
        from: `"SkillSwap" <skillswapalerts@gmail.com>`,
        to: user.email,
        subject: "Reset your SkillSwap password",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset</h2>
            <p>You requested to reset your password.</p>
            <p>This link is valid for <strong>15 minutes</strong>.</p>
            <a href="${resetURL}" target="_blank">
              Reset Password
            </a>
            <p>If you did not request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("EMAIL ERROR:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1️⃣ Validate input
    if (!password) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    // 2️⃣ Verify reset token
    const decoded = jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET
    );

    // 3️⃣ Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Update password
    user.password = hashedPassword;

    // OPTIONAL: invalidate refresh token
    user.refreshToken = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(400).json({
      message: "Reset link is invalid or expired",
    });
  }
};



const logout = async (req, res) => {
  try {
    // 🔥 Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};



module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  applyMentorRequest,
  getMyMentorRequestStatus, fetchMentors, refreshToken, sendConnectionRequest, getUserConnectionRequests, getMentorConnectionRequests, respondToConnectionRequest, forgotPassword, resetPassword, logout
};
