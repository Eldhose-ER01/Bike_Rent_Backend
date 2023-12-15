const User = require("../model/User");
const bike = require("../model/BikeAdd");
const jwt = require("jsonwebtoken");
const Partner = require("../model/Partner");
const { response } = require("../routes/User");
const nodemailer = require("nodemailer");
const { addAbortListener } = require("nodemailer/lib/xoauth2");

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
    const data = await User.find();

    if (data) {
      res
        .status(200)
        .json({ success: true, message: "find the datas", userdata: data });
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
    await dataofuser.save();

    const userdata = await User.find();
    return res.status(200).send({ message: "sucess", success: true, userdata });
  } catch (error) {
    console.log(error.message);
  }
};
// Partnerdata
const Partnerdata = async (req, res) => {
  try {
    const partnerdata = await Partner.aggregate([
      { $match: { isVerifed: "notVerified" } },
    ]);

    res.status(200).json({
      success: true,
      message: "This isyour data",
      partnerdata: partnerdata,
    });
  } catch (error) {
    console.log(error.message);
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
    const reject = await Partner.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "is reject" });
  } catch (error) {
    console.log(error);
  }
};

const FindPartners = async (req, res) => {
  try {
    const partnerdata = await Partner.find();
    if (partnerdata) {
      res.status(200).json({
        success: true,
        message: "datas is find",
        userdata: partnerdata,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
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
    const bikedata = await bike
      .find({ isVerifed: "notVerified" })
      .populate("ownerid");

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

const viewRequest = async (req, res) => {
  try {
    const bikedata = await bike.findOne({_id:req.query.id})
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
  viewRequest
};
