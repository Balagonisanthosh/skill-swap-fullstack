const mongoose = require("mongoose");
const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experienceYears: {
      type: Number,
      required: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },


    totalReviews: {
      type: Number,
      default: 0,
    },


    isActive: {
      type: Boolean,
      default: true,
    },
    approvedAt: Date,
    removedAt: Date,
    profileCompleted: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);
