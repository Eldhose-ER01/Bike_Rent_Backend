const User = require("../model/User");
const bike = require("../model/BikeAdd");
const jwt = require("jsonwebtoken");
const Booking = require("../model/Booking");
const Partner = require("../model/Partner");
const Coupon = require("../model/Coupon");
const nodemailer = require("nodemailer");

//Adminlogin
const Adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body.data;
    const Adminemail = process.env.EAMIL;
    const Adminpassword = process.env.PASSWORD;
    if (Adminemail == email && Adminpassword == password) {
      const KEY = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ eamil: email, role: "admin" }, KEY, {
        expiresIn: "4d",
      });
      const data = {
        token: token,
        email: email,
      };
      res
        .status(200)
        .json({ success: true, message: "login sucess", admindata: data });
    } else {
      res
        .status(201)
        .json({ success: false, messages: "wrong password or email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LoadUser

const LoadUser = async (req, res) => {
  try {
    const limit = 5;

    // Count total documents without skipping and limiting
    const totalItems = await User.countDocuments();

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search;
    let query = {};
    if (searchTerm) {
      query.fname = { $regex: new RegExp(searchTerm, "i") };
    }
    const data = await User.find(query).skip(skip).limit(limit);

    if (data) {
      res.status(200).json({
        success: true,
        message: "find the datas",
        userdata: data,
        totalPages,
        page,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
// Blockuser
const Blockuser = async (req, res) => {
  try {
    const id = req.query.id;
    const dataofuser = await User.findOne({ _id: id });
    dataofuser.status = !dataofuser.status;
    await User.findOneAndUpdate(
      { _id: id },
      { $set: { status: dataofuser.status } }
    );
    const userdata = await User.find();
    return res.status(200).send({ message: "sucess", success: true, userdata });
  } catch (error) {
    console.log(error.message);
  }
};
// Partnerdata
const Partnerdata = async (req, res) => {
  try {
    // Use aggregation pipeline for efficient pagination
    const partnerdata = await Partner.find({ isVerifed: "notVerified", Accept: "Accept" });
    res.status(200).json({
      success: true,
      message: "This is your data",
      partnerdata: partnerdata,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

let globalotp = null;
//Set up OTP creation,
function sMail(email, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const mailOptions =
    message == "success"
      ? {
          from: process.env.USER,
          to: email,
          subject: "Response from BIKE RENT KRL",
          html: '<p style="color:blue;">Your registration verification is completed. Now you can log in as a partner.</p>',
        }
      : {
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
// Acceptprq
const Acceptprq = async (req, res) => {
  try {
    const id = req.query.id;
    const partnerdatas = await Partner.findOne({ _id: id });
    const message = "success";
    sMail(partnerdatas.email, message);
    const verified = await Partner.findOneAndUpdate(
      { _id: id },
      { $set: { isVerifed: "verified" } }
    );
    res.status(200).json({ success: true, message: "sucess" });
  } catch (error) {
    console.log(error);
  }
};

// Rejectprq
const Rejectprq = async (req, res) => {
  try {
    const id = req.query.id;
    const partnerdata = await Partner.findOne({ _id: id });
    
    const message = "failer";
    sMail(partnerdata.email, message);
    const reject = await Partner.updateOne({ _id: id },{$set:{Accept:"reject"}});
    res.status(200).json({ success: true, message: "is reject" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const Rejectlist = async (req, res) => {
  try {
    console.log("jiiiiiii555555");
    const limit = 5;

    // Count total documents with the specified condition
    const totalItems = await Partner.countDocuments({ Accept: "reject" });

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const data = await Partner.find({ Accept: "reject" }).skip(skip).limit(limit);
    console.log(data, "datadata");
    if(data){
      res.status(200).json({ success:true, datas:data, totalPages, page });

    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Update your backend code

const FindPartners = async (req, res) => {
  try {
    const searchTerm = req.query.search;
    const limit = 5;

    // Count total documents without skipping and limiting
    const totalItems = await Partner.countDocuments();

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let query = {};

    if (searchTerm) {
      query.fname = { $regex: new RegExp(searchTerm, "i") };
    }

    const partnerdata = await Partner.find(query).skip(skip).limit(limit);
    res.status(200).json({
      success: true,
      message: "Data found",
      userdata: partnerdata,
      totalPages,
      page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ...

// Blockpartner
const Blockpartner = async (req, res) => {
  try {
    const id = req.query.id;
    const dataofuser = await Partner.findOne({ _id: id });

    dataofuser.status = !dataofuser.status;
    await Partner.findOneAndUpdate(
      { _id: id },
      { $set: { status: dataofuser.status } }
    );

    const userdata = await Partner.find();
    return res
      .status(200)
      .send({ message: "success", success: true, userdata });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};
// Bikerequest
const Bikerequest = async (req, res) => {
  try {
    const limit = 5;

    // Count total documents without skipping and limiting
    const totalItems = await Partner.countDocuments({
      isVerifed: "notVerified",
    });

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const bikedata = await bike
      .find({ isVerifed: "notVerified" })
      .populate("ownerid")
      .skip(skip)
      .limit(limit);

    if (bikedata) {
      res.status(200).json({
        success: true,
        message: "bikes is find",
        bikedata,
        totalPages,
        page,
      });
    } else {
      res.status(201).json({ success: false, message: "something wrong" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

const viewRequest = async (req, res) => {
  try {
    const bikedata = await bike.findOne({ _id: req.query.id });
    if (bikedata) {
      res
        .status(200)
        .json({ success: true, message: "bikes is find", bikedata });
    } else {
      res.status(201).json({ success: false, message: "something wrong" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

// BikeAccept
const BikeAccept = async (req, res) => {
  try {
    const id = req.query.id;
    const acceptdata = await bike.findOne({ _id: id });
    if (acceptdata) {
      await bike.findOneAndUpdate(
        {
          _id: id,
        },
        { $set: { isVerifed: "verified" } }
      );
      res.status(200).json({ success: true, message: "sucess" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};

function sMailforReject(email, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: "Response from BIKE RENT KRL",
    html: `<p style="color:blue;">your bike is rejected Becouse of ${message}</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
  });
}
// RejectAccept
const RejectAccept = async (req, res) => {
  try {
    const id = req.query.id;
    const findMail = await bike.findOne({ _id: id }).populate("ownerid");
    const message = req.query.message;
    sMailforReject(findMail.ownerid.email, message);
    const rejectdata = await bike.findOne({ _id: id });
    if (rejectdata) {
      await bike.deleteOne({ _id: id });
      res.status(200).json({ success: true, message: "is reject" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};
// PartnerBikeView
const PartnerBikeView = async (req, res) => {
  try {
    const id = req.body.data;
    const bikedatas = await bike.find({ ownerid: id });
    if (bikedatas) {
      res
        .status(200)
        .json({ success: true, message: "valus is find", bikedatas });
    } else {
      res.status(201).json({ success: false, message: "value is not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", success: false });
  }
};
// Blockbike
const Blockbike = async (req, res) => {
  try {
    const id = req.query.id;
    const dataofuser = await bike.findOne({ _id: id });
    dataofuser.status = !dataofuser.status;
    await dataofuser.save();

    return res
      .status(200)
      .send({ message: "success", success: true, status: dataofuser.status });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
};
// CheckifAdmin
const CheckifAdmin = (req, res) => {
  try {
    const tokenWithBearer = req.headers["authorization"];

    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Authorization header missing or invalid",
        success: false,
      });
    }

    const token = tokenWithBearer.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Auth failed", success: false });
      } else if (decoded.role === "admin") {
        const data = {
          token: token,
        };

        res.status(200).json({
          success: true,
          message: "This is working",
          userdata: data,
        });
      } else {
        res
          .status(403)
          .json({ message: "Not authorized as admin", success: false });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const Coupons = async (req, res) => {
  try {
    const data = req.body.data;
    const coupondata = new Coupon({
      couponName: data.couponName,
      experirydate: data.expirationDate,
      discountamount: data.discountAmount,
      maximumpurchase: data.maxPurchaseAmount,
      couponCode: data.couponcode,
    });
    await coupondata.save();
    if (coupondata) {
      res.status(200).json({ success: true, message: "data insert" });
    } else {
      res.status(201).json({ success: false, message: "data not insert" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const findcoupon = async (req, res) => {
  try {
    const limit = 5;

    // Count total documents without skipping and limiting
    const totalItems = await Coupon.countDocuments();

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const findcoupon = await Coupon.find().skip(skip).limit(limit);
    if (findcoupon) {
      res.status(200).json({
        success: true,
        message: "data find",
        findcoupon,
        totalPages,
        page,
      });
    } else {
      res.status(201).json({ success: false, message: "data find" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
const blockcoupon = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id, "id");
    const data = await Coupon.findOne({ _id: id });
    data.status = !data.status;
    await data.save();
    const datas = await Coupon.find();
    return res.status(200).send({ success: true, message: "sucesss", datas });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
const ChartView = async (req, res) => {
  try {
    const Totalusers=await User.find()
    const ToatalPartners=await Partner.find()
    const Bookingdata = await Booking.find()
      .populate("user")
      .populate("partner");
    let total = 0;
    if (Bookingdata.length > 0) {
      const complete = Bookingdata.filter(
        (booking) => booking.status === "Completed"
      );

      if (complete.length > 0) {
        const data = complete.map((value) => value.grandTotal);
        total = data.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        );
      } else {
        console.log("No completed bookings");
      }
    } else {
      console.log("null");
    }

    if (Bookingdata) {
      res.status(201).json({
        success: true,
        message: "data find",
        findbooking: Bookingdata,
        total,
        ToatalPartners,
        Totalusers
      });
    } else {
      res.status(200).json({ success: false, message: "data is not find" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const AdminSales = async (req, res) => {
  try {
    const limit = 7;

    const totalItems = await Booking.countDocuments();

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const datas = await Booking.find()
      .populate("partner")
      .populate("user")
      .skip(skip)
      .limit(limit);
    let total = 0;

    if (datas.length > 0) {
      const bookingdata = datas.filter(
        (booking) => booking.status === "Completed"
      );
      const data = bookingdata.map((value) => value.grandTotal);
      total = data.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      const bookingID = bookingdata.map((booking) => booking._id);
      const threeDigitIDs = bookingID.map((hexString) => {
        const decimalNumber = parseInt(hexString, 16);
        return ("11" + (decimalNumber % 1000)).slice(-3); // Ensure it's a three-digit number
      });

      const sortedNumericIDs = threeDigitIDs.map(Number).sort((a, b) => a - b);

      if (bookingdata) {
        res.status(200).json({
          success: true,
          message: "data find",
          bookingdata,
          total,
          IDs: sortedNumericIDs,
          totalPages,
          page,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = {
  Adminlogin,
  LoadUser,
  Blockuser,
  Partnerdata,
  Acceptprq,
  Rejectprq,
  FindPartners,
  Blockpartner,
  Bikerequest,
  BikeAccept,
  RejectAccept,
  PartnerBikeView,
  Blockbike,
  CheckifAdmin,
  viewRequest,
  Coupons,
  findcoupon,
  blockcoupon,
  ChartView,
  AdminSales,
  Rejectlist
};
