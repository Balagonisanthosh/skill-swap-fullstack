const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // default 60 mins
    },
    meetingLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent double booking for same mentor at same time
sessionSchema.index({ mentor: 1, scheduledAt: 1 }, { unique: true });

module.exports = mongoose.model("Session", sessionSchema);