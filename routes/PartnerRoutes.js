const express=require('express')
const partnerRoute=express()
const PartnerController=require('../controller/partnerController.js')


partnerRoute.post('/signup',PartnerController.partnerSignup)
partnerRoute.post('/login',PartnerController.partnerlogin)

module.exports=partnerRoute

