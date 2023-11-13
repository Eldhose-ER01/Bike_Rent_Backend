const User = require("../model/Usermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { response } = require("../routes/UserRouts");

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
const resendotp = async (req, res) => {
  try {
    console.log("sdfudsfdsufjdfj");
    const { email } = req.body.data.userdetails;

    const userexist = await User.findOne({ email: email });
    sendotp(email);
    res.status(200).json({ success: true, message: "resend" });
  } catch (error) {
    console.log(error.message);
  }
};

//OTP Submit
const otpsubmit = async (req, res) => {
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
const login = async (req, res) => {
  try {
    console.log(req.body.data);
    const user = req.body.data;

    const userdata = await User.findOne({ email: req.body.data.email });

    if (!userdata) {
      return res
        .status(200)
        .send({ incorrectemail: "Email is does Exist", success: false });
    }
    if (userdata.status == false) {
      res.status(201).send({ Block: "This Account is Block", success: false });
    }
    const passwordMatch = bcrypt.compareSync(user.password, userdata.password);
    if (!passwordMatch) {
      return res
        .status(201)
        .json({ incorrectPassword: "Password is incorrect", success: false });
    } else {
      const KEY = process.env.JWT_SECRET_KEY;
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

      res
        .status(200)
        .json({ success: true, message: "sucessfull login", userdatas: data });
    }
  } catch (error) {
    return res.status(401).send({
      message: "auth faild",
      sucess: false,
      error,
    });
  }
};

//User Signup in Google
const googledata = async (req, res) => {
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
const forgetPasswordOtp = async (req, res) => {
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
const forgetveryfyotp = async (req, res) => {
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
const Resetpassword = async (req, res) => {
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


const CheckifUser=async(req,res)=>{
  try {
    const tokenwithBearear=req.headers['authorization'];
        if(!tokenwithBearear||!tokenwithBearear.startswith('Bearer ')){
            return res.status(401).json({message:'Authorization header missing or invalid',success:false})
        }
        const token=tokenwithBearear.split(' ')[1];
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
            if(err){
                return res.status(401).json({message:'Auth faild',success:false})
            }else if(encoded.role=='user'){
                req.id=encoded.id;
                next();
            }
        })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
    }
  }
  


module.exports = {
  Usersignup,
  otpsubmit,
  resendotp,
  login,
  googledata,
  forgetPasswordOtp,
  Resetpassword,
  forgetveryfyotp,
  CheckifUser
};
