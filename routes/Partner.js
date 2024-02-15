const express=require('express')
const partnerRoute=express()
const middleware=require('../middleware/Auth.js')
const PartnerController=require('../controller/PartnerController.js')

/*---------------------Partner Signup and Login----------------*/
partnerRoute.post('/signup',PartnerController.PartnerSignup)
partnerRoute.post('/login',PartnerController.PartnerLogin)
partnerRoute.post('/checkispartner',PartnerController.CheckifPartner)
/*----------------------Total Profile Details and Edit----------------*/
partnerRoute.post('/addharupload',PartnerController.Aadhaar)
partnerRoute.get('/partnerprofile',middleware.partnerAuth,middleware.partnerblock,PartnerController.PartnerProfile)
partnerRoute.post('/partnerprofileimg',middleware.partnerAuth,middleware.partnerblock,PartnerController.PartnerProfileimg)
partnerRoute.post('/partnereditprofile',middleware.partnerblock,PartnerController.EditProfile)
/*----------------------Add Bikes And Another Features------------*/
partnerRoute.post('/addbike',middleware.partnerAuth,middleware.partnerblock,PartnerController.AddBikes)
partnerRoute.get('/findbikes',middleware.partnerAuth,middleware.partnerblock,PartnerController.FindBikes)
partnerRoute.post('/updatebike',middleware.partnerAuth,middleware.partnerblock,PartnerController.EditBikes)
partnerRoute.put('/deletebike',middleware.partnerAuth,PartnerController.DeleteBike)
/*----------------------View The Booking and Change The Stauts--------------*/
partnerRoute.get('/getbooking',middleware.partnerAuth,middleware.partnerblock,PartnerController.Bookings)
partnerRoute.post('/bookingchange',middleware.partnerAuth,middleware.partnerblock,PartnerController.BookingStatusChange)
partnerRoute.post('/cancelbooking',middleware.partnerAuth,middleware.partnerblock,PartnerController.BookingCancel)
partnerRoute.get('/chartbooking',middleware.partnerAuth,middleware.partnerblock,PartnerController.ChartView)
/*----------------------Total Partner Chat---------------------------------*/
partnerRoute.get('/chatuser',middleware.partnerAuth,middleware.partnerblock,PartnerController.uniquechatuser)
partnerRoute.get('/getChat',middleware.partnerAuth,PartnerController.getChat)
partnerRoute.post('/saveChat',middleware.partnerAuth,PartnerController.saveChat)




module.exports=partnerRoute

