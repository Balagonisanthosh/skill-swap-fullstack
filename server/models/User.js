const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    skillsYouKnown: {
      type: [String],
      default: [],
    },

    skillsYouWantToLearn: {
      type: [String],
      default: [],
    },

    profileImage: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "mentor"],
      default: "user",
    },

    mentorStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
