const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true

    },
    phone:{
        type:Number
    },
    password:{
        type:String,
        
    },
    image:{
        type:String
    },
    status:{
       type:Boolean,
       default:true
    },
    licenseFrontSide:{
        type:String,
    },
    licenseBackSide:{
        type:String,
        
    },
    wallet:{
        type:Number,
        default:0
    },
    wallethistory:{
        type:[{
            tdate:{type:Date},
            amount:{type:Number},
            tType:{type:String}
        }]
    },
    state:{
       type:String
    },
    district:{
        type:String
    },
    lincenno:{
        type:String

    }

})
module.exports=mongoose.model("user",userSchema)