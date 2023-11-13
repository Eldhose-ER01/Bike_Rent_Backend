const express = require('express')
const userRoute = express()
const userController=require('../controller/userController')
// const middleware=require('../middleware/Auth')


userRoute.post('/signup',userController.Usersignup)
userRoute.post('/otpsubmit',userController.otpsubmit)
userRoute.post('/resendotp',userController.resendotp)
userRoute.post('/login',userController.login)
userRoute.post('/googleauth',userController.googledata)
userRoute.post('/provideemail',userController.forgetPasswordOtp)
userRoute.post('/forgetveryfyotp',userController.forgetveryfyotp)
userRoute.post('/resetpassword',userController.Resetpassword)
userRoute.post('/checkIfUser',userController.CheckifUser)


module.exports= userRoute