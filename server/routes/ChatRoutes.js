const express = require("express");
const authMiddleWare = require("../middleware/authMiddleWare");
const { getOrCreateConversation, getMessages, sendMessage, getMyConversations } = require("../controllers/chat-Controller");
const router = express.Router();


router.post("/conversation", authMiddleWare, getOrCreateConversation);
router.get("/messages/:conversationId", authMiddleWare, getMessages);
router.post("/message", authMiddleWare, sendMessage);
router.get("/conversations", authMiddleWare, getMyConversations);


module.exports = router;
