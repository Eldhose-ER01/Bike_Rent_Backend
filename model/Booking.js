const mongoose=require('mongoose')
const BookingSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },
    bike:{
        type:mongoose.Schema.ObjectId,
        ref:"Bike",
        required:true
    },
    partner:{
        type:mongoose.Schema.ObjectId,
        ref:"partner"
        
    },
    pickUpDate:{
        type:String,
        required:true
    },
    PickupTime:{
        type:String,
        required:true
    },
    dropTime:{
        type:String,
        required:true
    },
    dropDate:{
        type:String,
        required:true
    },
   
    paymentMethod:{
        type:String,
       
    },
    paymentStatus:{
        type:String,
       
    },
    helmet:{
        type:String,
       
    },
    grandTotal:{
        type:Number,
    },
    TotalAmount:{
        type:Number,
        required:true
    },
    Sgst:{
        type:Number,
        required:true
    },
    Cgst:{
        type:Number
    },
    discountAmount:{
        type:Number,
    },
    additionalAmount:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"booked"
    },
    date:{
        type:Date,
    },
    helmet:{
        type:Number
    },
    statuschange:{
        type:Boolean,
        default:true
    }
   
})
module.exports=mongoose.model("booking",BookingSchema)