const express = require('express');
const userRoute = express();
const userController = require('../controller/UserController');
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
userRoute.post('/editprofile',middleware.userAuth,userController.GetProfile);
userRoute.post('/imageupload', middleware.userAuth, userController.ImageUpload);
userRoute.post('/licenseFrontSide',middleware.userAuth,userController.ProofFrontid)
userRoute.post('/licenseBackSide',middleware.userAuth,userController.ProofBackid)
userRoute.get('/getbike',middleware.userAuth,userController.GetBike)
userRoute.post('/datesfind',middleware.userAuth,userController.FindbikeDateBased)
userRoute.post('/create-checkout-session',middleware.userAuth,userController.Payments)
userRoute.get('/bookingview',middleware.userAuth,userController.BookingView)
userRoute.post('/cancelbooking',middleware.userAuth,userController.CancelBooking)




module.exports = userRoute;
