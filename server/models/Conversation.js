const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
      validate: {
        validator: (v) => v.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },

    // 💬 Last message preview
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

// Add deterministic unique key for participant pair
conversationSchema.add({
  participantsKey: { type: String, required: true, unique: true, index: true },
});

// Build participantsKey before validation
conversationSchema.pre("validate", function () {
  if (this.participants && Array.isArray(this.participants)) {
    try {
      const ids = this.participants.map((p) => String(p));
      ids.sort();
      this.participantsKey = ids.join("_");
    } catch (err) {
      // ignore
    }
  }
});

module.exports = mongoose.model("Conversation", conversationSchema);
