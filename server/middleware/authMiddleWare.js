const jwt = require("jsonwebtoken");

const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
      mentorStatus: decoded.mentorStatus,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Access token expired or invalid",
    });
  }
};



module.exports = authMiddleWare;
