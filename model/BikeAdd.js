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
    rcimage:{
        type:String,
     
     },
    isVerifed:{
        type:String,
        default:"notVerified"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    ownerid:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"partner",
    },
    status:{
        type:Boolean,
        default:true
    }, 
    bookingdates: [
        {
          startingdate: { type: String },
          endingdate: { type: String },
        },
      ],


})
module.exports=mongoose.model("Bike",BikeaddSchema)

