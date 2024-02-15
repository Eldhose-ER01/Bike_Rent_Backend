const express = require('express');
const userRoute = express();
const userController = require('../controller/UserController');
const middleware = require('../middleware/Auth');

/*-----------------User Login,Signup And The Details--------------------*/
userRoute.post('/signup', userController.Usersignup);
userRoute.post('/otpsubmit', userController.OtpSubmit);
userRoute.post('/resendotp', userController.ResendOtp);
userRoute.post('/login',userController.Login);
userRoute.post('/googleauth', userController.GoogleData);
userRoute.post('/provideemail', userController.ForgetPasswordOtp);
/*-----------------Forget Passowrd And Reset-----------------------------*/
userRoute.post('/forgetveryfyotp', userController.ForgetVeryfyotp);
userRoute.post('/resetpassword', userController.ResetPassword);
userRoute.post('/checkIfUser', userController.CheckifUser);
/*-----------------User Profiles and Edit -------------------------------*/
userRoute.get('/profile',middleware.userAuth,middleware.userblock,userController.UserProfile);
userRoute.post('/editprofile',middleware.userAuth,middleware.userblock,userController.GetProfile);
userRoute.post('/imageupload', middleware.userAuth,userController.ImageUpload);
/*---------------Provide Documents---------------------------------------*/
userRoute.post('/licenseFrontSide',middleware.userAuth,userController.ProofFrontid)
userRoute.post('/licenseBackSide',middleware.userAuth,userController.ProofBackid)
/*---------------View All Bikes-------------------------------------------*/
userRoute.get('/getbike',middleware.userAuth,middleware.userblock,userController.BikeSelect)
userRoute.get('/findbikes',userController.findbikes)
/*---------------All Booking Details--------------------------------------*/
userRoute.post('/datesfind',middleware.userAuth,middleware.userblock,userController.FindbikeDateBased)
userRoute.post('/create-checkout-session',middleware.userAuth,userController.Payments)
userRoute.post('/alredybooked',middleware.userAuth,userController.AlredyBooked)
userRoute.get('/bookingview',middleware.userAuth,middleware.userblock,userController.BookingView)
userRoute.post('/cancelbooking',middleware.userAuth,middleware.userblock,userController.CancelBooking)
userRoute.get('/usercoupon',middleware.userAuth,userController.findcoupons)
userRoute.post('/Applycoupon',middleware.userAuth,userController.Applycoupon)
/*--------------Wallet Hostory---------------------------------------------*/
userRoute.get('/wallethistory',middleware.userAuth,middleware.userblock,userController.wallethistory)
userRoute.get('/bookingpartner',middleware.userAuth,middleware.userblock,userController.bookingPartners)
/*----------------Chat From User Side--------------------------------------*/
userRoute.get('/getChat',middleware.userAuth,userController.getChat)
userRoute.post('/saveChat',middleware.userAuth,userController.saveChat)



module.exports = userRoute;
