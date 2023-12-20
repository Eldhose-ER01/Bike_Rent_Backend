const partner = require("../model/Partner");
const addbike = require("../model/BikeAdd");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Booking=require('../model/Booking')
const { ObjectId } = require('mongodb')

// PartnerSignup

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
// PartnerLogin

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
          const KEY = process.env.JWT_SECRET_KEY;
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
// Aadhaar

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

// PartnerProfile

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
// CheckifPartner

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
// PartnerProfileimg
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
// EditProfile
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
// AddBikes
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
      rcimage
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
        rcimage:rcimage
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
// FindBikes
const FindBikes = async (req, res) => {
  try {
    const id = req.id;
    const bikelist = await addbike.find({ isVerifed: "verified", ownerid: id });

    if (bikelist) {
      res
        .status(200)
        .json({ success: true, message: "bikes are find", bikelist });
    } else {
      res.status(201).json({ success: false, message: "bikes not find" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
// EditBikes
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
// DeleteBike
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

const Bookings=async(req,res)=>{
  try {
  const id = req.id;

  const objectId = new ObjectId(id);
  console.log(objectId, 'this is partnerid');


    const booking = await Booking.find({partner:objectId}).populate('user').populate('bike')
    
   console.log(booking,"12345666677");    

    
    if(booking){
      res.status(200).json({success:true,message:"data find",booking})
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });

  }
}


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
  Bookings
};
