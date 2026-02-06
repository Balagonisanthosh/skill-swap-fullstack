const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔒 HARD DATABASE LOCK (MOST IMPORTANT)
connectionRequestSchema.index(
  { userId: 1, mentorId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
