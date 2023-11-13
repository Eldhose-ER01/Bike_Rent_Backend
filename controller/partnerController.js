const partner = require('../model/Partnermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const partnerSignup = async (req, res) => {
  try {
    const { fname, lname, email, phone, password, pin, companyname,cfpassword, city } = req.body.data;
    if(password==cfpassword){

   
    const partnerdata = await partner.findOne({ email: email });

    if (!partnerdata) {
      const hashpassword = await bcrypt.hash(password, 10);
      const userdata = new partner({
        fname,
        lname,
        email,
        phone,
        pin,
        companyname,
        city,
        password: hashpassword,
      });

     await userdata.save();

      if (userdata) {
        res.status(200).json({ success: true, message: "Registration successful" });
      } else {
        res.status(201).json({ success: false, message: "Registration failed" });
      }
    }else{
      res.status(201).json({success:false,messages:"Email Alredy Exists"})
    }}
    else{
      res.status(202).json({success:false,password:"Password do not match"})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const partnerlogin = async (req, res) => {
  try {
    const { email, password } = req.body.data;

    const partnerdata = await partner.findOne({ email: email });

    if (partnerdata && partnerdata.isVerifed === "verified") {
      console.log(partnerdata, "llllllllll");

      if (!partnerdata) {
        return res.status(200).send({ incorrectemail: "Email does not exist", success: false });
      }

      const passwordMatch = bcrypt.compareSync(password, partnerdata.password);
      
      if (!passwordMatch) {
        return res.status(201).json({ incorrectPassword: "Password is incorrect", success: false });
      } else {
        console.log("hellooooooooooooooo");
        const KEY = process.env.JWT_SECRET_KEY;
        const token = jwt.sign(
          { id: partnerdata._id, role: "partner" },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );
        console.log(token, "tokennnnnnnnn");
        const data = {
          name: `${partnerdata.fname} ${partnerdata.lname}`,
          token: token,
          id: partnerdata._id,
        };
        console.log(data, "dattttttttttttttttt");

        res.status(200).json({ success: true, message: "Successful login", partnerdata: data });
      }
    } else {
      res.status(200).json({ success: false, messages: "Admin has not verified the user" });
    }
  } catch (error) {
    return res.status(401).send({
      message: "Authentication failed",
      success: false,
      error,
    });
  }
};

module.exports = {
  partnerSignup,partnerlogin
};
