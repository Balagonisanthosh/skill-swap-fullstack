const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
require("dotenv").config();


async function connectToDb() {
  

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
    // Try to drop legacy array unique index on conversations if present
    try {
      const coll = mongoose.connection.collection('conversations');
      const indexes = await coll.indexes();
      const idx = indexes.find(i => i.name === 'participants_1');
      if (idx) {
        console.log('Dropping legacy index participants_1');
        await coll.dropIndex('participants_1');
        console.log('Dropped legacy index participants_1');
      }
    } catch (dropErr) {
      // don't crash if drop fails; log for debugging
      console.warn('Could not drop legacy participants_1 index (may not exist):', dropErr.message || dropErr);
    }
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error);
    process.exit(1);
  }
}


module.exports = connectToDb;
