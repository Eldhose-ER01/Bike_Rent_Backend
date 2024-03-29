const mongoose=require('mongoose')
const PartnerSchema=new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    companyname:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }, 
    isVerifed:{
        type:String,
        default:"notVerified"
    },
    image:{
        type:String
        
    },
    password:{
        type:String,
        required:true
    },
    city:{
        type:String,
    },
    locations:[{
        name:{type:String}
    }],
    aadhaar:{
        type:String,
    },
    state:{
        type:String,
    },
    sublocation:{
       type:String
    },
    district:{
        type:String,
    },
    Accept:{
        type:String,
        default:"Accept"

    }


})
module.exports=mongoose.model("partner",PartnerSchema)