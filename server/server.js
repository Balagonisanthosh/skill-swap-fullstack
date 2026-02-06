const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/db");
require("dotenv").config();
const adminRoute = require("./routes/AdminRoutes");
const authRoute = require("./routes/AuthRoutes");
const mentorRoute = require("./routes/mentorRoute");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local Vite dev
      "https://skill-swap-fullstack.vercel.app" // production frontend
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/mentors", mentorRoute);

async function databaseConnection() {
  try {
    await connectToDb();
    startServer();
  } catch (error) {
    console.error("Database connection failed", error);
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
}

databaseConnection();
