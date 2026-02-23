const mongoose =require("mongoose");

const sessionSchema=new mongoose(
    {
        mentor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        mentee:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,   
        },
        meetingLink:{
            type:String,

        },
        status:{
            type:String,
            enum:["schedule","completed","cancelled"],
            default:"schedule"
        },
        completedAt:Date,    
    },
    {
        timestamps  :true
    }
);
export default mongoose.model("Session",sessionSchema);