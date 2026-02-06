const mongoose = require("mongoose");

const mentorRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    linkedInURL: {
        type: String,
        trim: true,
        required:true
    },
    uploadVideo: {
        type: String,
        trim: true,
        required:true
    },
    status: {
        type: String,
        enum: ["none","pending", "approved", "rejected","removed"],
        default: "pending"

    },
     rejectionReason: {
      type: String, 
      default: null,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("MentorRequest", mentorRequestSchema);
