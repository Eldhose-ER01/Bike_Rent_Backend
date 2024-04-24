const User = require("../model/User");
const Booking = require("../model/Booking");
const ChatModel = require("../model/Conversations");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const bike = require("../model/BikeAdd");
const Partner = require("../model/Partner");
const Coupon = require("../model/Coupon");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const stripe = Stripe(
  "sk_test_51ONBCPSCuu8kH4kkSPnawvp6PPYOmsowDJhrbnOHJYinxC8es0Hm9aM1rZ7PuFTLFp7ZfXnKTyOPpVmoiBdugt7p00yNAlu1PM"
);

/*-----------------------Set up OTP creation-----------------------------------------*/
let globalotp = null;
function sMail(email, otp) {
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
    subject: "Your OTP",
    text: `This is your OTP:${otp}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
  });
}
/*---------------------------OTP Generate Function---------------------------------*/
function sendotp(email) {
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  sMail(email, otp);
  globalotp = otp;
}

/*----------------------------User Signup in client side-----------------*/
const Usersignup = async (req, res) => {
  try {
    const { email} = req.body.data;

    const userexist = await User.findOne({ email: email });
    if (!userexist) {
      sendotp(email);
      res.status(200).json({ success: true, message: "email success sent" });
    } else {
      return res
        .status(201)
        .send({ success: false, errorMessage: "email already exist" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "something wrong" });
  }
};

/*****************User Click the resend otp--------------*/
const ResendOtp = async (req, res) => {
  try {
    const { email } = req.body.data.userdetails;

    const userexist = await User.findOne({ email: email });
    sendotp(email);
    res.status(200).json({ success: true, message: "resend" });
  } catch (error) {
    console.log(error.message);
  }
};

/*-------------------OTP Submit----------------*/
const OtpSubmit = async (req, res) => {
  try {
    const data = req.body;
    const obj = req.body.data.otp;

    const a = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        a.push(obj[key]);
      }
    }

    const number = parseInt(a.join(""), 10);

    if (globalotp == number) {
      const { fname, lname, email, phone, password } =
        req.body.data.userdetails;
      const hashpassword = await bcrypt.hash(password, 10);
      const userdata = new User({
        fname,
        lname,
        email,
        phone,
        password: hashpassword,
        image:
          "https://i.pinimg.com/564x/e8/7a/b0/e87ab0a15b2b65662020e614f7e05ef1.jpg",
      });
      const savedata = await userdata.save();
      if (savedata) {
        res.status(200).json({ success: true, message: "its sucess" });
      }
    } else {
      res.status(201).json({ success: false, messages: "Wrong OTP" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

/*---------------User Login IN client side-----------------*/
const Login = async (req, res) => {
  try {
    const user = req.body.data;

    const userdata = await User.findOne({ email: req.body.data.email });

    if (!userdata) {
      return res
        .status(200)
        .send({ incorrectemail: "Email does not exist", success: false });
    }

    if (userdata.status === false) {
      return res
        .status(201)
        .send({ Block: "This Account is Blocked", success: false });
    }

    const passwordMatch = bcrypt.compareSync(user.password, userdata.password);

    if (!passwordMatch) {
      return res
        .status(201)
        .json({ incorrectPassword: "Password is incorrect", success: false });
    } else {
      // const KEY = process.env.JWT_SECRET_KEY;
      const token = jwt.sign(
        { id: userdata._id, role: "user" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );
      const data = {
        name: `${userdata.fname} ${userdata.lname}`,
        token: token,
        id: userdata._id,
      };

      return res
        .status(200)
        .json({ success: true, message: "Successful login", userdatas: data });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

/*---------------------User Signup in Google---------------*/
const GoogleData = async (req, res) => {
  try {
    const { firstName, lastName, email, photoUrl } =
      req.body.data._tokenResponse;

    const userdata = await User.findOne({ email: email });

    if (!userdata) {
      const savedata = new User({
        fname: firstName,
        lname: lastName,
        email: email,
        image: photoUrl,
      });

      const userdetails = await savedata.save();

      const KEY = process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ id: userdetails._id, role: "user" }, KEY, {
        expiresIn: "1d",
      });

      const data = {
        name: `${userdetails.fname} ${userdetails.lname}`,
        token: token,
        id: userdetails._id,
      };

      res.status(200).json({
        success: true,
        message: "successful login",
        userdatas: data,
      });
    } else {
      res.status(201).json({
        success: false,
        message: "authentication failed",
      });
    }
  } catch (error) {
    console.error("Error in googledata function:", error);
    res.status(500).send("Internal Server Error");
  }
};
/*-------------------------- ForgetPasswordOtp--------------*/

const ForgetPasswordOtp = async (req, res) => {
  try {
    const email = req.body.data;
    const userdata = await User.findOne({ email: email });
    if (userdata) {
      sendotp(email);
      res
        .status(200)
        .json({ success: true, message: "Valild email provide the otp" });
    } else {
      res.status(201).json({ success: false, message: "otp falild" });
    }
  } catch (error) {
    return res.status(401).send({
      message: "faild",
      sucess: false,
      error,
    });
  }
};

/*---------------------- ForgetVeryfyotp--------------------*/

const ForgetVeryfyotp = async (req, res) => {
  try {
    const obj = req.body.data.otp;
    const a = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        a.push(obj[key]);
      }
    }

    const number = parseInt(a.join(""), 10);
    if (globalotp == number) {
      res
        .status(200)
        .json({ success: true, message: "otp varification sucess" });
    } else {
      res.status(201).json({ success: false, messages: "Wrong otp" });
    }
  } catch (error) {
    return res.status(401).send({
      message: "faild",
      sucess: false,
      error,
    });
  }
};
/*---------------------ResetPassword-------------*/

const ResetPassword = async (req, res) => {
  try {
    const { resetpassword, password, email } = req.body.data;

    if (password === resetpassword) {
      const hashpassword = await bcrypt.hash(password, 10);

      const updatepassword = await User.updateOne(
        { email: email },
        {
          $set: {
            password: hashpassword,
          },
        }
      );

      if (updatepassword) {
        return res.status(200).json({
          success: true,
          message: "reset password is complete",
        });
      } else {
        return res.status(201).json({
          success: false,
          message: "failed to update password",
        });
      }
    } else {
      return res.status(201).json({
        success: false,
        messages: "passwords do not match",
      });
    }
  } catch (error) {
    return res.status(401).send({
      message: "failed",
      success: false,
      error,
    });
  }
};
/*------------------ CheckifUser-----------------------*/

const CheckifUser = async (req, res) => {
  try {
    const tokenWithBearer = req.headers["authorization"];
    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization header missing or invalid",
        success: false,
      });
    }
    const token = tokenWithBearer.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Auth failed", success: false });
      } else if (decoded.role === "user") {
        try {
          const userdatas = await User.findOne({ _id: decoded.id });

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
/*---------------------- UserProfile-----------------*/

const UserProfile = async (req, res) => {
  try {
    const userdetails = await User.findById(req.id);

    res
      .status(200)
      .json({ success: true, message: "details find", user: userdetails });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*--------------------------GetProfile-----------------*/
const GetProfile = async (req, res) => {
  try {
    const { fname, lname, email, phone, image, state, district, lincenno } =
      req.body.data;
    const userdata = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fname: fname,
          lname: lname,
          email: email,
          phone: phone,
          state: state,
          image: image,
          district: district,
          lincenno: lincenno,
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
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*--------------------------ImageUpload-----------------*/

const ImageUpload = async (req, res) => {
  try {
    const image = req.body.id;
    await User.findByIdAndUpdate(req.id, { $set: { image: image } })
      .then((res) => {
        res
          .status(200)
          .json({ message: "Image upload successful", success: true });
      })
      .catch((err) => {
        console.log(err.message);
        res
          .status(200)
          .json({ message: "Image upload successful", success: true });
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
/*--------------------------ProofFrontid the licence-----------------*/

const ProofFrontid = async (req, res) => {
  try {
    const frontidimage = req.body.id;
    const data = await User.findByIdAndUpdate(req.id, {
      $set: { licenseFrontSide: frontidimage },
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

/*--------------------------findbikes-----------------*/
const findbikes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const totalItems = await bike.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    const bikes = await bike.find().populate("ownerid").skip(skip).limit(limit);

    const bikesdata = bikes.filter((value) => {
      return value.status == true && value.ownerid.status == true;
    });
    res.status(200).json({
      success: true,
      message: "bike are find",
      bikesdata,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------------ProofBackid-----------------*/

const ProofBackid = async (req, res) => {
  try {
    const frontidimage = req.body.id;
    const data = await User.findByIdAndUpdate(req.id, {
      $set: { licenseBackSide: frontidimage },
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

/*-------------------GetBike from user side---------------*/

const BikeSelect = async (req, res) => {
  try {
    const inputDate = new Date();
    const day = inputDate.getUTCDate();
    const month = inputDate.getUTCMonth() + 1; // Months are zero-indexed, so we add 1
    const year = inputDate.getUTCFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    const bikes = await bike.find().populate("ownerid");

    const bikesdata = bikes.filter((value) => {
      return value.status == true && value.ownerid.status == true;
    });

    res
      .status(200)
      .json({ success: true, message: "bike are find", bikesdata });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------------FindbikeDateBased-----------------*/

const FindbikeDateBased = async (req, res) => {
  try {
    const id = req.id;
    const user = await User.findById(id);
    const wallet = user.wallet;
    const { pickupdate, dropdate, city } = req.body.data;
    const everyBike = await bike.find().populate("ownerid");

    const filtercity = everyBike.filter((value) => value.ownerid.city == city);

    const findBike = filtercity.filter((value) => {
      if (value.bookingdates.length === 0) {
        return true;
      } else {
        const isOverlap = value.bookingdates.some((dates) => {
          return (
            (pickupdate >= dates.startingdate &&
              pickupdate <= dates.endingdate) ||
            (dropdate >= dates.startingdate && dropdate <= dates.endingdate) ||
            (pickupdate <= dates.startingdate && dropdate >= dates.endingdate)
          );
        });

        return !isOverlap;
      }
    });

    res.status(200).json({
      message: "bike filtered",
      success: true,
      bikedata: findBike,
      wallet: wallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------------AlredyBooked-----------------*/

const AlredyBooked = async (req, res) => {
  try {
    const { pickupdate, dropdate, city } = req.body.data[0];
    const { BikeId } = req.body.data[0].BikeId._id;
    const everyBike = await bike.find().populate("ownerid");

    const filtercity = everyBike.filter((value) => value.ownerid.city == city);

    const findBike = filtercity.filter((value) => {
      if (value.bookingdates.length === 0) {
        return true;
      } else {
        const isOverlap = value.bookingdates.some((dates) => {
          return (
            (pickupdate >= dates.startingdate &&
              pickupdate <= dates.endingdate) ||
            (dropdate >= dates.startingdate && dropdate <= dates.endingdate) ||
            (pickupdate <= dates.startingdate && dropdate >= dates.endingdate)
          );
        });

        return !isOverlap;
      }
    });
    res.status(200).json({
      message: "bike filtered",
      success: true,
      bikedata: findBike,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

/*--------------------------Payments-----------------*/

const Payments = async (req, res) => {
  try {
    console.log(req.body, "");
    const users = req.id;
    const userdata = await User.findOne({ _id: users });
    if (userdata.licenseFrontSide && userdata.licenseBackSide) {
      const BikeId = req.body.data[0].BikeId._id;
      const bikes = await bike.findById(BikeId);
      const {
        totalAmount,
        cgst,
        sgst,
        finalAmount,
        helmet,
        Paymentmethod,
        coupon,
      } = req.body.data[1];
      const { picktime, pickupdate, dropdate, DropTime } = req.body.data[0];
      if (Paymentmethod == "online") {
        const amount_online = finalAmount - coupon;
        var session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: "Bikes",
                },
                unit_amount: amount_online * 100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: "https://bikerunrider.vercel.app/successbooking",
          cancel_url: "https://bikerunrider.vercel.app/bikebooking",
        });
      } else if (Paymentmethod == "wallet") {
        const userdata = await User.findById(users);
        if (userdata.wallet >= finalAmount) {
          const walletamount = userdata.wallet - finalAmount;

          await User.findByIdAndUpdate(
            users,
            {
              $set: {
                wallet: walletamount,
              },
            },
            { new: true }
          );
        } else {
          res.status(201).json({
            success: false,
            notamount: "Wallet has no money to make this booking",
          });
          return;
        }
      }
      const bookingdata = new Booking({
        pickUpDate: pickupdate,
        dropTime: DropTime,
        dropDate: dropdate,
        PickupTime: picktime,
        bike: BikeId,
        TotalAmount: totalAmount,
        grandTotal: finalAmount - coupon,
        Sgst: sgst,
        Cgst: cgst,
        user: users,
        helmet: helmet,
        paymentMethod: Paymentmethod,
        partner: bikes.ownerid,
      });

      const date = {
        startingdate: pickupdate,
        endingdate: dropdate,
      };

      await bookingdata.save().then(async (res) => {
        const findchatpartner = await ChatModel.find({
          partnerId: bikes.ownerid,
        });

        if (!findchatpartner) {
          const userchat = await ChatModel.find({ userId: users });
          if (!userchat) {
            const openChat = new ChatModel({
              userId: users,
              partnerId: bikes.ownerid,
            });
            await openChat.save();
          }
        } else {
          const userchat = await ChatModel.find({ userId: users });
          if (!userchat) {
            const openChat = new ChatModel({
              userId: users,
              partnerId: bikes.ownerid,
            });
            await openChat.save();
          } else {
            const openChat = new ChatModel({
              userId: users,
              partnerId: bikes.ownerid,
            });
            await openChat.save();
          }
        }
      });

      await bike.findOneAndUpdate(
        { _id: BikeId },
        {
          $push: {
            bookingdates: date,
          },
        }
      );
      if (Paymentmethod == "online") {
        res
          .status(200)
          .json({ url: session.url, success: true, message: "Data stored" });
      } else if (Paymentmethod == "wallet") {
        res.status(200).json({
          success: true,
          message: "Booking Started",
          wallet: "successbooking",
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Invalid payment method" });
      }
    }
  } catch (error) {
    // Handle errors
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*-------------------------------BookingView----------------*/
const BookingView = async (req, res) => {
  try {
    const limit = 5;
    const totalItems = await Booking.find({ user: req.id }).countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.id })
      .populate("bike")
      .populate("user")
      .skip(skip)
      .limit(limit);

    if (bookings) {
      res.status(200).send({ success: true, bookings, page, totalPages });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*---------------------CancelBooking---------------------*/
const CancelBooking = async (req, res) => {
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
      res
        .status(201)
        .json({ success: false, Running: "your vechicle is running" });
    } else if (bookingData.status == "Completed") {
      res
        .status(201)
        .json({ success: false, completed: "your vechicle is running" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*-----------------findcoupons-----------------*/
const findcoupons = async (req, res) => {
  try {
    const findcoupon = await Coupon.find({ status: true });
    if (findcoupon) {
      res.status(200).json({ success: true, message: "data find", findcoupon });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*-----------------Applycoupon---------------------*/
const Applycoupon = async (req, res) => {
  try {
    const couponcode = req.body.data.code;

    const user = req.id;
    const toatalAmout = req.body.data.amonut;
    if (couponcode) {
      const findcoupon = await Coupon.findOne({ couponCode: couponcode });
      if (findcoupon) {
        const is_User_used = findcoupon.user.find((value) => {
          return value.id == user;
        });

        if (is_User_used) {
          res
            .status(201)
            .json({ success: false, message: "coupon is already used" });
        } else {
          if (findcoupon.maximumpurchase <= toatalAmout) {
            const currentDate = new Date();
            const formattedCurrentDate =
              currentDate.toLocaleDateString("en-GB");

            const formattedCouponExpiryDate = new Date(
              findcoupon.experirydate
            ).toLocaleDateString("en-GB");

            if (formattedCurrentDate < formattedCouponExpiryDate) {
              const data_1 = {
                id: user,
              };
              await Coupon.findOneAndUpdate(
                { _id: findcoupon._id },
                {
                  $push: { user: data_1 },
                }
              );

              res.status(201).json({
                success: true,
                message: "coupon is applaid successfully",
                amount: findcoupon.discountamount,
              });
            } else {
              res
                .status(201)
                .json({ success: false, message: "coupon is expired" });
            }
          } else {
            res.status(201).json({
              success: false,
              message: "coupon cannot applay on this purchase",
            });
          }
        }
      } else {
        res
          .status(201)
          .json({ success: false, message: "coupon code is invalid" });
      }
    } else {
      res
        .status(201)
        .json({ success: false, message: "please enter anything" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*-------------------Total wallet History--------------------*/

const wallethistory = async (req, res) => {
  try {
    const id = req.id;
    const limit = 5;

    const totalItems = await Booking.find({
      $and: [
        { user: id },
        { status: "Completed" },
        { paymentMethod: "wallet" },
      ],
    }).countDocuments();

    const totalPages = Math.ceil(totalItems / limit);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const booking = await Booking.find({
      $and: [
        { user: id },
        { status: "Completed" },
        { paymentMethod: "wallet" },
      ],
    })
      .populate("user")
      .populate("bike")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, history: booking, page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/*-----------------------------Total bookingPartners----------------------*/

const bookingPartners = async (req, res) => {
  try {
    const id = req.id;
    const bookings = await Booking.find({ user: req.id }).populate("partner");

    const uniquePartners = Array.from(
      new Set(bookings.map((booking) => booking.partner))
    );

    res.status(200).json({ success: true, message: "find it", uniquePartners });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/*-----------------------Save Chat from user----------------*/
const saveChat = async (req, res) => {
  try {
    const { chat, partnerId } = req.body.data;
    const partnerIds = new mongoose.Types.ObjectId(partnerId);
    const findChat = await ChatModel.find({
      $and: [{ partnerId: partnerIds }, { userId: req.id }],
    })
      .populate("userId")
      .populate("partnerId");
    if (findChat.length > 0) {
      await ChatModel.findOneAndUpdate(
        { partnerId: partnerId, userId: req.id },
        { $push: { chat: chat } },
        { new: true, upsert: true }
      ).then(() => {
        res.status(200).json({ success: true });
      });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/*-----------------------Take Chat From User-----------*/
const getChat = async (req, res) => {
  try {
    const partnerId = new mongoose.Types.ObjectId(req.query.id);
    const userId = new mongoose.Types.ObjectId(req.id);

    const findChat = await ChatModel.find({
      $and: [{ partnerId: partnerId }, { userId: userId }],
    })
      .populate("userId")
      .populate("partnerId");

    if (findChat.length > 0) {
      // Chat found, send it in the response
      res.status(200).send({
        success: true,
        findChat,
      });
    } else {
      // Chat not found, handle accordingly
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
  Usersignup,
  OtpSubmit,
  ResendOtp,
  Login,
  GoogleData,
  ForgetPasswordOtp,
  ResetPassword,
  ForgetVeryfyotp,
  UserProfile,
  GetProfile,
  ImageUpload,
  CheckifUser,
  ProofFrontid,
  ProofBackid,
  BikeSelect,
  FindbikeDateBased,
  Payments,
  BookingView,
  CancelBooking,
  findcoupons,
  Applycoupon,
  wallethistory,
  bookingPartners,
  saveChat,
  getChat,
  findbikes,
  AlredyBooked,
};
