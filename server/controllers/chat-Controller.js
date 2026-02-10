const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ---------------- CREATE / GET CONVERSATION ----------------
const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const senderId = req.user.id;

    // create deterministic participantsKey for atomic lookup/upsert
    const pair = [String(senderId), String(receiverId)].sort();
    const participantsKey = pair.join("_");

    // use atomic findOneAndUpdate with upsert to avoid race conditions
    const filter = { participantsKey };
    const update = { $setOnInsert: { participants: [senderId, receiverId], participantsKey } };
    const options = { new: true, upsert: true };

    let conversation;
    try {
      conversation = await Conversation.findOneAndUpdate(filter, update, options).exec();
    } catch (err) {
      console.error("getOrCreateConversation findOneAndUpdate error:", err);
      // If duplicate-key from legacy index remains, try fallback find
      if (err && err.code === 11000) {
        conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
      } else {
        throw err;
      }
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("getOrCreateConversation error:", error);
    res.status(500).json({
      message: "Failed to get or create conversation",
      error: error.message,
    });
  }
};


// ---------------- SEND MESSAGE (UPDATED) ----------------
const sendMessage = async (req, res) => {
  try{
  const { conversationId, text } = req.body;

  // 1️⃣ Create message
  const message = await Message.create({
    conversationId,
    senderId: req.user.id,
    text,
    readBy: [req.user.id], // 👁 sender has read it
  });

  // 2️⃣ Update last message in conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });

  res.status(201).json(message);
}
catch(error)
{
  console.log(error);
  res.status(500).json({
    message:error,
  })
}
};

// ---------------- GET MESSAGES + MARK AS READ ----------------
const getMessages = async (req, res) => {
  try{
  const { conversationId } = req.params;
  const userId = req.user.id;

  // 👁 Mark messages as read
  await Message.updateMany(
    {
      conversationId,
      readBy: { $ne: userId },
    },
    {
      $push: { readBy: userId },
    }
  );

  const messages = await Message.find({ conversationId })
    .populate("senderId", "username profileImage")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
}
catch(error)
{
  console.log(error);
  return res.status(500).josn({
    message:error
  })
}

};



// ---------------- GET MY CONVERSATIONS (UPDATED) ----------------
const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // load conversations and lastMessage/populated participants
    let conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username profileImage")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "username",
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    // attach unreadCount for the requesting user for each conversation
    conversations = await Promise.all(
      conversations.map(async (c) => {
        const unread = await Message.countDocuments({ conversationId: c._id, readBy: { $ne: userId } });
        c.unreadCount = unread || 0;
        return c;
      })
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error("getMyConversations error:", error);
    res.status(500).json({ message: "Failed to load conversations", error: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getMyConversations,
};
