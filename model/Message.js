const mongoose=require('mongoose')
const MessageSchema=new mongoose.Schema({
    chatId:{
        type:String,
    },
    senderId:{
        type:String,
    },
    message:{
        type:String,
    },
},
{
    timestamps:true,


})
module.exports=mongoose.model("message",MessageSchema)