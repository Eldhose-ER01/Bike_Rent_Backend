const express=require('express')
const partnerRoute=express()
const middleware=require('../middleware/Auth.js')
const PartnerController=require('../controller/PartnerController.js')


partnerRoute.post('/signup',PartnerController.PartnerSignup)
partnerRoute.post('/login',PartnerController.PartnerLogin)
partnerRoute.post('/checkispartner',PartnerController.CheckifPartner)
partnerRoute.post('/addharupload',PartnerController.Aadhaar)
partnerRoute.get('/partnerprofile',middleware.partnerAuth,PartnerController.PartnerProfile)
partnerRoute.post('/partnerprofileimg',middleware.partnerAuth,PartnerController.PartnerProfileimg)
partnerRoute.post('/partnereditprofile',PartnerController.EditProfile)
partnerRoute.post('/addbike',middleware.partnerAuth,PartnerController.AddBikes)
partnerRoute.get('/findbikes',middleware.partnerAuth,PartnerController.FindBikes)
partnerRoute.post('/updatebike',middleware.partnerAuth,PartnerController.EditBikes)
partnerRoute.put('/deletebike',middleware.partnerAuth,PartnerController.DeleteBike)
partnerRoute.get('/getbooking',middleware.partnerAuth,PartnerController.Bookings)


module.exports=partnerRoute

