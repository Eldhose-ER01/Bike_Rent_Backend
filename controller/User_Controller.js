const User = require("../model/User_Model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const bike = require("../model/Bikeadd_Model");

let globalotp = null;
//Set up OTP creation,
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
    text: `This is your OTP${otp}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
  });
}
//OTP Generate Function
function sendotp(email) {
  console.log(email);
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  sMail(email, otp);
  globalotp = otp;
}

//User Signup in client side
const Usersignup = async (req, res) => {
  try {
    const { fname, lname, email, phone, password } = req.body.data;

    const userexist = await User.findOne({ email: email });
    if (!userexist) {
      sendotp(email);
      res.status(200).json({ success: true, message: "mIl success sent" });
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

//User Click the resend otp
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

//OTP Submit
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

//User Login IN client side
const Login = async (req, res) => {
  try {
    console.log(req.body.data);
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

//User Signup in Google
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
// ForgetPasswordOtp

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
// ForgetVeryfyotp

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
// ResetPassword

const ResetPassword = async (req, res) => {
  try {
    const { resetpassword, password, email } = req.body.data;

    if (password === resetpassword) {
      const hashpassword = await bcrypt.hash(password, 10);
      console.log(hashpassword);

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
// CheckifUser

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
// UserProfile

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
// GetProfile
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
// ImageUpload
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
// ProofFrontid the licence
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
// ProofBackid the licence
const ProofBackid = async (req, res) => {
  try {
    const frontidimage = req.body.id;
    console.log(frontidimage, "ghrhifdidhiueh");
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

// GetBike from user side
const GetBike = async (req, res) => {
  try {
    const bikes = await bike.find().populate("ownerid");
    const bikesdata = bikes.filter((value) => {
      return value.status == true && value.ownerid.status == true;
    });
    res
      .status(200)
      .json({ success: true, message: "bike are find", bikesdata });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
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
  GetBike,
};
