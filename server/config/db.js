const mongoose=require("mongoose");
require("dotenv").config();

async function connectToDb()
{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("database connected successfuly...");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
        
    }
}
module.exports=connectToDb;