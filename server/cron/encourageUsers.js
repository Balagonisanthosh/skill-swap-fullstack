const cron = require("node-cron");
const User = require("../models/User");
const sendEmail = require("../config/sendMail");

// Runs every day at 10:00 AM
cron.schedule("0 10 * * *", async () => {
  console.log("🚀 Running encouragement job");

  try {
    const users = await User.find();
    console.log("Users found:", users.length);

    for (const user of users) {
      try {
        await sendEmail(
          user.email,
          "Keep Growing on SkillSwap 🚀",
          `
          <h3>Hello ${user.username},</h3>
          <p>Share a skill today or learn something new!</p>
          <p>Log in now and connect with others.</p>
          <br/>
          <strong>SkillSwap Team 💡</strong>
          `
        );

        console.log(`✅ Email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed for ${user.email}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error("❌ Error sending emails:", error);
  }
});