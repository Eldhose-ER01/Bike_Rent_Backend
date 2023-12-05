const express = require('express');
const userRoute = express();
const userController = require('../controller/User_Controller');
const middleware = require('../middleware/Auth');



userRoute.post('/signup', userController.Usersignup);
userRoute.post('/otpsubmit', userController.OtpSubmit);
userRoute.post('/resendotp', userController.ResendOtp);
userRoute.post('/login', userController.Login);
userRoute.post('/googleauth', userController.GoogleData);
userRoute.post('/provideemail', userController.ForgetPasswordOtp);
userRoute.post('/forgetveryfyotp', userController.ForgetVeryfyotp);
userRoute.post('/resetpassword', userController.ResetPassword);
userRoute.post('/checkIfUser', userController.CheckifUser);
userRoute.get('/profile', middleware.userAuth, userController.UserProfile);
userRoute.post('/editprofile', userController.GetProfile);
userRoute.post('/imageupload', middleware.userAuth, userController.ImageUpload);
userRoute.post('/licenseFrontSide',middleware.userAuth,userController.ProofFrontid)
userRoute.post('/licenseBackSide',middleware.userAuth,userController.ProofBackid)
userRoute.get('/getbike',userController.GetBike)

module.exports = userRoute;
