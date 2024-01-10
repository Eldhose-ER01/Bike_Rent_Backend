const mongoose=require('mongoose')
const couponSchema=new mongoose.Schema({
  couponName:{
    type:String,

  },
  experirydate:{
    type:String,
  },
  discountamount:{
    type:Number
  },
  maximumpurchase:{
    type:Number
  },
  status:{
    type:Boolean,
    default:true
  },
  couponCode:{
    type:String
  },
  user:[
    {
      id:{type:String}
    }
  ]
   
  
})
module.exports=mongoose.model("coupon",couponSchema)