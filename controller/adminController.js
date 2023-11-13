const User=require('../model/Usermodel')
const jwt = require("jsonwebtoken");
const Partner=require('../model/Partnermodel');
const { response } = require('../routes/UserRouts');
const nodemailer = require("nodemailer");
const { addAbortListener } = require('nodemailer/lib/xoauth2');

const Adminlogin=async(req,res)=>{
try {
  console.log(req.body);
  const{email,password}=req.body.data
  const Adminemail=process.env.EAMIL
  const Adminpassword=process.env.PASSWORD
  if(Adminemail==email&&Adminpassword==password){
   
    const KEY=process.env.JWT_SECRET_KEY
    const token=jwt.sign({eamil:email,role:"admin"},KEY, { expiresIn: "4d" })
    const data = {
       
        token: token,
        email: email,
      };
      res.status(200).json({success:true,message:"login sucess",admindata:data})

  }else{
    res.status(201).json({success:false,messages:"wrong password or email"})
  }
} catch (error) {
    console.log(error.message);
}
}

const loadUser=async(req,res)=>{
  try {
    const data=await User.find()
  
    if(data){
      res.status(200).json({success:true,message:"find the datas",userdata:data})
    }
  } catch (error) {
    console.log(error);
  }
}

const blockuser=async(req,res)=>{
  try {
    const id=req.query.id
    const dataofuser=await User.findOne({_id:id})

  
    dataofuser.status==false? await User.findOneAndUpdate({_id:id},{$set:{status:true}}):await User.findOneAndUpdate({_id:id},{$set:{status:false}})
  

    const userdata=await User.find()
    return res.status(200).send({message:"sucess",success:true,userdata})
    
  } catch (error) {
    console.log(error);
  }
}

const partnerdata=async(req,res)=>{
  try {
    const partnerdata=await Partner.aggregate([{$match:{isVerifed:"notVerified"}}])
    
    res.status(200).json({success:true,message:"This isyour data",partnerdata:partnerdata})
  } catch (error) {
    console.log(error.message);
  }
}
let globalotp = null;
//Set up OTP creation,
function sMail(email,message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const mailOptions = message=="success"?
   {
    from: process.env.USER,
    to: email,
    subject: "Response from BIKE RENT KRL",
    html: '<p style="color:blue;">Your registration verification is completed. Now you can log in as a partner.</p>',
  }:  {
    from: process.env.USER,
    to: email,
    subject: "Response from BIKE RENT KRL",
    html: '<p style="color:red;">Your registration verification is reject.</p>',
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
  });
}

const Acceptprq=async(req,res)=>{
  try {
    const id=req.query.id
    const partnerdatas=await Partner.findOne({_id:id})
    const message="success"
    sMail(partnerdatas.email,message)
    const verified=await Partner.findOneAndUpdate({_id:id},{$set:{isVerifed:"verified"}})
    res.status(200).json({success:true,message:"sucess"})
  } catch (error) {
    console.log(error);
  }
}

const Rejectprq=async(req,res)=>{
  try {
    const id=req.query.id
    const partnerdata=await Partner.findOne({_id:id})
   
    const message="failer"
    sMail(partnerdata.email,message)
    const reject=await Partner.deleteOne({_id:id})
    res.status(200).json({success:true,message:"is reject"})

  } catch (error) {
    console.log(error);
  }
}

const findPartners=async(req,res)=>{
  try {
    console.log("hhhhhhhhhhhhhhh");
    const partnerdata=await Partner.find()
    console.log(partnerdata,"kkkkkkkkkkkk");
    if(partnerdata)
    {
      res.status(200).json({success:true,message:"datas is find",userdata:partnerdata})
    }
  } catch (error) {
    console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
  }
}


const blockpartner=async(req,res)=>{
  try {
    const id=req.query.id
    const dataofuser=await Partner.findOne({_id:id})

  
    dataofuser.status==false? await Partner.findOneAndUpdate({_id:id},{$set:{status:true}}):await Partner.findOneAndUpdate({_id:id},{$set:{status:false}})
  

    const userdata=await Partner.find()
    return res.status(200).send({message:"sucess",success:true,userdata})
    
  } catch (error) {
    console.log(error);
  }
}


module.exports={
    Adminlogin,
    loadUser,
    blockuser,
    partnerdata,
    Acceptprq,
    Rejectprq,
    findPartners,
    blockpartner
}
