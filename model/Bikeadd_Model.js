const mongoose=require('mongoose')
const BikeaddSchema=new mongoose.Schema({
    Bikename:{
        type:String,
      
    },
    brand:{
        type:String,
       
    },
    platenumber:{
        type:String,
       
    },
    Category:{
        type:String,
        
    },
    Sublocation:{
        type:String,
       
    },
    VehicleCC:{
        type:String,
      
    },
    FuelType:{
        type:String,
      
    },
    RentPerDay:{
        type:Number,
       
    },
    image:{
       type:String,
    
    },
    isVerifed:{
        type:String,
        default:"notVerified"
    },
    ownerid:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"partner",
    },
    status:{
        type:Boolean,
        default:true
    }, 

})
module.exports=mongoose.model("Bike",BikeaddSchema)

