const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/db");
require("dotenv").config();
const helmet = require("helmet");
// require("./config/redis");
const { connectRedis } = require("./config/redis");
const adminRoute = require("./routes/AdminRoutes");
const authRoute = require("./routes/AuthRoutes");
const mentorRoute = require("./routes/mentorRoute");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const chatRoutes = require("./routes/ChatRoutes");
const sessionRoutes = require("./routes/SessionRoutes");
const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3000;


// ---------------- MIDDLEWARE ----------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://skill-swap-fullstack.vercel.app",
    ],
    credentials: true,
  })
);
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.disable("x-powered-by");
app.use(helmet());
app.use("/uploads", express.static("uploads"));
app.use("/api/sessions", sessionRoutes);
// ---------------- ROUTES ----------------
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/mentors", mentorRoute);
app.use("/api/chat", chatRoutes);
app.use(generalLimiter);

// ---------------- HTTP SERVER ----------------
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://skill-swap-fullstack.vercel.app",
    ],
    credentials: true,
  },
});

// ---------------- SOCKET AUTH ----------------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error("Invalid token"));
  }
});

// ---------------- SOCKET EVENTS ----------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.user.id);

  // Join conversation room
  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.user.id} joined ${conversationId}`);
  });

  // Send message (SAVE + EMIT)
 socket.on("sendMessage", async ({ conversationId, text }) => {
  try {
    let message = await Message.create({
      conversationId,
      senderId: socket.user.id,
      text,
      readBy: [socket.user.id], // sender has read it
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    // Populate sender details so clients receive username/profile immediately
    message = await message.populate("senderId", "username profileImage");

    io.to(conversationId).emit("receiveMessage", message);
  } catch (error) {
    console.error("Message send error:", error);
  }
});

  // Notify room that this user has read messages
  socket.on("messagesRead", ({ conversationId, readerId }) => {
    try {
      // broadcast to other clients in the room so they can update UI (seen badges)
      io.to(conversationId).emit("messagesRead", { conversationId, readerId });
    } catch (err) {
      console.error("messagesRead emit error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.user.id);
  });
});

// ---------------- DATABASE + SERVER ----------------
async function databaseConnection() {
  try {
    await connectRedis();
    await connectToDb();
    require('./cron/encourageUsers');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
  }
}

databaseConnection();
