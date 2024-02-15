const mongoose = require("mongoose");
const partner = require("../model/Partner");
const User = require("../model/User");
const addbike = require("../model/BikeAdd");
const ChatModel = require("../model/Conversations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Booking = require("../model/Booking");
const { ObjectId } = require("mongodb");

/*--------------------PartnerSignup----------------------*/

const PartnerSignup = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      phone,
      password,
      companyname,
      cfpassword,
      city,
      state,
      district,
      sublocation,
      aadhaar,
    } = req.body.data;
    if (password == cfpassword) {
      const partnerdata = await partner.findOne({ email: email });

      if (!partnerdata) {
        const hashpassword = await bcrypt.hash(password, 10);
        const userdata = new partner({
          fname,
          lname,
          email,
          phone,
          companyname,
          city,
          state,
          district,
          sublocation,
          aadhaar,
          password: hashpassword,
          image:
            "https://i.pinimg.com/564x/e8/7a/b0/e87ab0a15b2b65662020e614f7e05ef1.jpg",
        });

        await userdata.save();

        if (userdata) {
          res
            .status(200)
            .json({ success: true, message: "Registration successful" });
        } else {
          res
            .status(201)
            .json({ success: false, message: "Registration failed" });
        }
      } else {
        res
          .status(201)
          .json({ success: false, messages: "Email Alredy Exists" });
      }
    } else {
      res
        .status(202)
        .json({ success: false, password: "Password do not match" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
/*-------------------------------------- PartnerLogin-----------------------*/

const PartnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body.data;

    const partnerdata = await partner.findOne({ email: email });
    if (partnerdata.status == false) {
      return res
        .status(200)
        .json({ success: false, Block: "This Account Is Blocked" });
    } else {
      if (partnerdata && partnerdata.isVerifed === "verified") {
        if (!partnerdata) {
          return res
            .status(200)
            .send({ incorrectemail: "Email does not exist", success: false });
        }

        const passwordMatch = bcrypt.compareSync(
          password,
          partnerdata.password
        );

        if (!passwordMatch) {
          return res.status(201).json({
            incorrectPassword: "Password is incorrect",
            success: false,
          });
        } else {
          const token = jwt.sign(
            { id: partnerdata._id, role: "partner" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );
          const data = {
            name: `${partnerdata.fname} ${partnerdata.lname}`,
            token: token,
            id: partnerdata._id,
          };

          res.status(200).json({
            success: true,
            message: "Successful login",
            partnerdata: data,
          });
        }
      } else {
        res.status(200).json({
          success: false,
          messages: "Admin has not verified the user",
        });
      }
    }
  } catch (error) {
    return res.status(401).send({
      message: "Authentication failed",
      success: false,
      error,
    });
  }
};
/*-------------------------Aadhaar---------------------*/

const Aadhaar = async (req, res) => {
  try {
    const frontidimage = req.body.id;
    const data = await User.findByIdAndUpdate(req.id, {
      $set: { aadhaar: frontidimage },
    });
    if (data) {
      res
        .status(200)
        .json({ message: "Image upload successful", success: true, data });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*----------------------- PartnerProfile-----------------*/

const PartnerProfile = async (req, res) => {
  try {
    const userdata = await partner.findById(req.id);
    if (userdata) {
      res
        .status(200)
        .json({ success: true, message: "This is the data", userdata });
    } else {
      res.status(201).json({ success: false, message: "somthing wrong" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*------------------- CheckifPartner-----------------------*/

const CheckifPartner = async (req, res) => {
  try {
    const tokenWithBearer = req.headers["authorization"];
    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Authorization header missing or invalid",
        success: false,
      });
    }
    const token = tokenWithBearer.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Auth failed", success: false });
      } else if (decoded.role === "partner") {
        try {
          const userdatas = await partner.findOne({ _id: decoded.id });
          const data = {
            name: `${userdatas.fname} ${userdatas.lname}`,
            token: token,
            id: userdatas._id,
          };
          res.status(200).json({
            success: true,
            message: "This is working",
            userdatas: data,
          });
        } catch (error) {
          console.log(error.message);
          res
            .status(500)
            .send({ message: "Something went wrong", success: false });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*---------------- PartnerProfileimg-------------------*/
const PartnerProfileimg = async (req, res) => {
  try {
    const image = req.body.id;
    const data = await partner.findByIdAndUpdate(req.id, {
      $set: { image: image },
    });
    if (data) {
      res
        .status(200)
        .json({ message: "Image upload successful", success: true, data });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*--------------- EditProfile from Partner ----------------*/
const EditProfile = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      phone,
      companyname,
      state,
      district,
      sublocation,
      city,
    } = req.body.data;
    const userdata = await partner.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fname: fname,
          lname: lname,
          email: email,
          phone: phone,
          state: state,
          district: district,
          city: city,
          companyname: companyname,
          sublocation: sublocation,
        },
      },
      { new: true }
    );

    if (userdata) {
      res.json({
        message: "Profile updated successfully",
        success: true,
        user: userdata,
      });
    } else {
      res.status(404).json({ message: "User not found", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*------------------------AddBikes from Partner---------------------*/
const AddBikes = async (req, res) => {
  try {
    const {
      Bikename,
      brand,
      platenumber,
      Category,
      Sublocation,
      VehicleCC,
      FuelType,
      RentPerDay,
      image,
      rcimage,
    } = req.body.data;
    const plateexist = await addbike.findOne({ platenumber: platenumber });
    if (!plateexist) {
      const bikedata = new addbike({
        Bikename: Bikename,
        brand: brand,
        platenumber: platenumber,
        Category: Category,
        Sublocation: Sublocation,
        VehicleCC: VehicleCC,
        FuelType: FuelType,
        RentPerDay: RentPerDay,
        ownerid: req.id,
        image: image,
        rcimage: rcimage,
      });
      await bikedata.save();
      if (bikedata) {
        res.status(200).json({ success: true, message: "its working" });
      } else {
        res.status(201).json({ success: false, message: "it not found" });
      }
    } else {
      res
        .status(201)
        .json({ success: false, messages: "Bike NUmber alredy exist" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*------------------FindBikes form partner--------------------*/
const FindBikes = async (req, res) => {
  try {
    const id = req.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const totalItems = await addbike
      .find({ isVerifed: "verified", ownerid: id })
      .countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const skip = (page - 1) * limit;
    const bikelist = await addbike
      .find({ isVerifed: "verified", ownerid: id })
      .skip(skip)
      .limit(limit);

    if (bikelist) {
      res
        .status(200)
        .json({
          success: true,
          message: "bikes are find",
          bikelist,
          totalPages,
          page,
        });
    } else {
      res.status(201).json({ success: false, message: "bikes not find" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*------------------EditBikes----------------------*/
const EditBikes = async (req, res) => {
  try {
    const { Bikename, brand, RentPerDay, id, image } = req.body.data;

    const bikedata = await addbike.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          Bikename: Bikename,
          brand: brand,
          RentPerDay: RentPerDay,
          image: image,
        },
      }
    );

    if (bikedata) {
      res.status(200).json({ success: true, message: "value is updated" });
    } else {
      res.status(201).json({ success: false, message: "something wrong" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*---------------------------DeleteBike------------------------*/
const DeleteBike = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await addbike.deleteOne({ _id: id });

    if (data) {
      res.status(200).json({ success: true, message: "Bike deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*---------------------Bookings Views From partner side---------------------*/
const Bookings = async (req, res) => {
  try {
    const id = req.id;
    const objectId = new ObjectId(id);
    const limit = 4;

    // Count total documents without skipping and limiting
    const totalItems = await Booking.countDocuments({ partner: objectId });

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const booking = await Booking.find({ partner: objectId })
      .populate("user")
      .populate("bike")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Check if any documents were found
    if (booking.length > 0) {
      res.status(200).json({
        success: true,
        message: "Data found",
        booking,
        totalPages,
        page,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No data found",
        totalPages,
        page,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*----------------BookingStatusChange From Partner--------------------*/
const BookingStatusChange = async (req, res) => {
  try {
    const id = req.query.id;
    const inputDate = new Date();
    const day = inputDate.getUTCDate();
    const month = inputDate.getUTCMonth() + 1;
    const year = inputDate.getUTCFullYear();

    const formattedDate = `${year}-${month}-${day}`;

    var currentDateAndTime = new Date();

    currentDateAndTime.setHours(12);
    currentDateAndTime.setMinutes(30);
    currentDateAndTime.setSeconds(0);

    var formattedTime = currentDateAndTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const bookingdata = await Booking.findById(id);

    const pickUpDate = bookingdata.pickUpDate;
    const dropDate = bookingdata.dropDate;
    const PickupTime = bookingdata.PickupTime;
    const dropTime = bookingdata.dropTime;

    if (formattedDate > pickUpDate && formattedDate <= dropDate) {
      await Booking.findByIdAndUpdate(
        id,
        { $set: { status: "Running" } },
        { new: true }
      );
      res.status(200).json({ success: true, messages: "sucesss" });
    } else if (dropDate <= formattedDate && dropTime < formattedTime) {
      await Booking.findByIdAndUpdate(
        id,
        { $set: { status: "Completed" } },
        { new: true }
      );
      res.status(200).json({ success: true, complete: "sucesss" });
    } else {
      res.status(201).json({ error: "error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*----------------------BookingCancel----------------*/
const BookingCancel = async (req, res) => {
  try {
    const id = req.query.id;
    const bookingData = await Booking.findById(id).populate("user");
    let wallet = bookingData.user.wallet;
    const grandTotal = bookingData.grandTotal;
    const sum = wallet + grandTotal;

    if (bookingData.status == "booked") {
      const updatedUser = await User.findByIdAndUpdate(
        bookingData.user._id,
        { $set: { wallet: sum } },
        { new: true }
      );

      console.log(updatedUser.wallet, "wallet");
      if (updatedUser) {
        await Booking.findByIdAndUpdate(
          id,
          {
            $set: {
              statuschange: false,
              status: "Canceld",
            },
          },
          { new: true }
        );
      }
      res.status(200).json({ success: true, message: "cancel" });
    } else if (bookingData.status == "Running") {
      res.status(201).json({ success: false, Running: "not canceld" });
    } else if (bookingData.status == "Completed") {
      res.status(201).json({ success: false, Completed: "not canceld" });
    } else if (bookingData.status == "Canceld") {
      res.status(201).json({ success: false, canceld: "not canceld" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------------------ChartView from partner---------------------*/
const ChartView = async (req, res) => {
  try {
    const id = req.id;
    const limit = 5;

    // Count total documents without skipping and limiting
    const totalItems = await Booking.countDocuments({ partner: id });

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const findbooking = await Booking.find({ partner: id })
      .populate("user")
      .populate("bike")
      .skip(skip)
      .limit(limit);

    let total = 0;
    let complete = [];
    let unique = 0;

    if (findbooking) {
      complete = findbooking.filter(
        (booking) => booking.status === "Completed"
      );

      const userss = findbooking.map((value) => value.user.email);
      unique = Array.from(new Set(userss));

      if (complete.length > 0) {
        total = complete.reduce(
          (accumulator, currentValue) => accumulator + currentValue.grandTotal,
          0
        );
      } else {
        console.log("No completed bookings");
      }

      const bookingID = findbooking.map((booking) => booking._id);
      const threeDigitIDs = bookingID.map((hexString) => {
        const decimalNumber = parseInt(hexString, 16);
        return ("11" + (decimalNumber % 1000)).slice(-3); // Ensure it's a three-digit number
      });

      const sortedNumericIDs = threeDigitIDs.map(Number).sort((a, b) => a - b);

      res.status(200).json({
        success: true,
        message: "Data found",
        findbooking,
        total,
        complete,
        unique,
        Ids: sortedNumericIDs,
        totalPages,
        page,
      });
    } else {
      console.log("No bookings found");
      res.status(404).json({ success: false, message: "No bookings found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------uniquechatuser view from partner---------------------*/
const uniquechatuser = async (req, res) => {
  try {
    const id = req.id;

    const objectId = new ObjectId(id);

    const bookings = await Booking.find({ partner: objectId })
      .populate("user")
      .populate("bike");

    const uniqueUserIds = [
      ...new Set(bookings.map((booking) => booking.user._id)),
    ];

    const uniqueUsers = await User.find({ _id: { $in: uniqueUserIds } });
    res.status(200).json({ success: true, booking: uniqueUsers });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*-------------------------------saveChat from partner-----------------*/
const saveChat = async (req, res) => {
  try {
    const { chat, userid } = req.body.data;
    const userIds = new mongoose.Types.ObjectId(userid);

    const findChat = await ChatModel.find({
      $and: [{ partnerId: req.id }, { userId: userIds }],
    })
      .populate("userId")
      .populate("partnerId");
    if (findChat.length > 0) {
      // Chat already exists, update it
      await ChatModel.findOneAndUpdate(
        { partnerId: req.id, userId: userIds },
        { $push: { chat: chat } },
        { new: true, upsert: true }
      ).then(() => {
        res.status(200).json({ success: true });
      });
    } else {
      // Chat doesn't exist, handle accordingly
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/*----------------------------Get Chat form Partner--------------------*/
const getChat = async (req, res) => {
  try {
    const id = req.query.id;
    const userId = new mongoose.Types.ObjectId(id);
    const partnerId = new mongoose.Types.ObjectId(req.id);
    const findChat = await ChatModel.find({
      $and: [{ partnerId: partnerId }, { userId: userId }],
    })
      .populate("userId")
      .populate("partnerId");
    if (findChat) {
      res.status(200).send({
        success: true,
        findChat,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Chat not found",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  PartnerSignup,
  PartnerLogin,
  Aadhaar,
  PartnerProfile,
  CheckifPartner,
  PartnerProfileimg,
  EditProfile,
  AddBikes,
  FindBikes,
  EditBikes,
  DeleteBike,
  Bookings,
  BookingStatusChange,
  BookingCancel,
  ChartView,
  uniquechatuser,
  saveChat,
  getChat,
};
