const cron = require("node-cron");
const User = require("../models/User");
const transporter = require("../config/EmailTransporter");

cron.schedule('0 10 * * *', async () => {
    console.log("running encouragement job");
    try {
        const users = await User.find();
        console.log("Users found:", users.length);
        for (const user of users) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Keep Growing on SkillSwap 🚀",
                html: `
          <h3>Hello ${username},</h3>
          <p>Share a skill today or learn something new!</p>
          <p>Log in now and connect with others.</p>
          <br/>
          <strong>SkillSwap Team 💡</strong>`
        })
        console.log(`email sent to ${user.email}`);
        }
    } catch (error) {
        console.error("Error sending emails:", error);
        
    }
})