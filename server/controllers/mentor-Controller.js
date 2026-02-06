const Mentor = require("../models/Mentor");
const User = require("../models/User");

const getMyMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.id });

    if (!mentor) {
      return res.status(200).json({
        exists: false,
        message: "Mentor profile does not exist",
      });
    }

    return res.status(200).json({
      exists: true,
      profileCompleted: mentor.profileCompleted,
      mentor,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch mentor profile",
    });
  }
};


// const createMentorProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { title, bio, skills, experienceYears } = req.body;

//     if (!title || !bio || !skills || !experienceYears) {
//       return res.status(400).json({
//         message: "Please fill all fields",
//       });
//     }

//     const mentor = await Mentor.findOne({ userId });

//     if (!mentor) {
//       return res.status(403).json({
//         message: "Mentor profile not found. Approval required.",
//       });
//     }

//     mentor.title = title;
//     mentor.bio = bio;
//     mentor.skills = skills;
//     mentor.experienceYears = experienceYears;
//     mentor.profileCompleted = true; 

//     await mentor.save();

//     return res.status(200).json({
//       success: true,
//       mentor,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to save mentor profile",
//     });
//   }
// };

const createMentorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, bio, skills, experienceYears } = req.body;

    if (!title || !bio || !skills || !experienceYears) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    let mentor = await Mentor.findOne({ userId });

    if (!mentor) {
      mentor = await Mentor.create({
        userId,
        title,
        bio,
        skills,
        experienceYears,
        isActive: true,
        profileCompleted: true,
      });
    } else {
      mentor.title = title;
      mentor.bio = bio;
      mentor.skills = skills;
      mentor.experienceYears = experienceYears;
      mentor.profileCompleted = true;
      await mentor.save();
    }

    // ✅ VERY IMPORTANT: update user role
    await User.findByIdAndUpdate(userId, {
      role: "mentor",
      mentorStatus: "approved",
    });

    return res.status(200).json({
      success: true,
      mentor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save mentor profile" });
  }
};






module.exports = {
  getMyMentorProfile,
  createMentorProfile,
};
