const partner = require("../model/Partner");
const User=require("../model/User")
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const tokenWithBearer = req.headers["authorization"];

    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer ")) {
      console.error("Authorization header missing or invalid");
      return res
        .status(401)
        .json({
          message: "Authorization header missing or invalid",
          success: false,
        });
    }

    const token = tokenWithBearer.split(" ")[1];
    // const tokenString = String(token);
console.log(token,"tokentokentoken..................................................");
    const cleanedToken = token.replace(/"/g, "");
    console.log(cleanedToken,"cleanedToken");
    jwt.verify(cleanedToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
      } else if (decoded.role === "user") {
        req.id = decoded.id;

        next();
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const tokenWithBearer = req.headers["authorization"];
    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer ")) {
      console.error("Authorization header missing or invalid");
      return res
        .status(401)
        .json({
          message: "Authorization header missing or invalid",
          success: false,
        });
    }

    const token = tokenWithBearer.split(" ")[1];
    // const tokenString = String(token);

    const cleanedToken = token.replace(/"/g, "");
    jwt.verify(cleanedToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
      } else if (decoded.role === "admin") {
        req.id = decoded.id;

        next();
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const partnerAuth = async (req, res, next) => {
  try {
    const tokenWithBearer = req.headers["authorization"];
    if (!tokenWithBearer || !tokenWithBearer.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          message: "Authorization header missing or invalid",
          success: false,
        });
    }

    const token = tokenWithBearer.split(" ")[1];

    const cleanedToken = token.replace(/"/g, "");
    jwt.verify(cleanedToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
      } else if (decoded.role === "partner") {
        req.id = decoded.id;

        next();
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
const partnerblock = async (req, res, next) => {
  const partnerdata = await partner.findById(req.id);
  if (partnerdata.status == true) {
    next();
  } else {
    res.status(200).json({ success: false, message: "partner is blocked" });
  }
};

const userblock = async (req, res, next) => {
  const userdata= await User.findById(req.id);

  if (userdata && userdata.status === true) {
    next();
  }else {
    res.status(200).json({ success: false, message: "partner is blocked" });
  }
};

module.exports = {
  userAuth,
  adminAuth,
  partnerAuth,
  partnerblock,
  userblock

};
