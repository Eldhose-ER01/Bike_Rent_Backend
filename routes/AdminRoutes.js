const express=require('express')
const adminRoutes=express()
const adminController=require('../controller/adminController')

adminRoutes.post('/login',adminController.Adminlogin)
adminRoutes.get('/userlist',adminController.loadUser)
adminRoutes.put('/statuschange',adminController.blockuser)
adminRoutes.get('/partnerreq',adminController.partnerdata)
adminRoutes.put('/rejectdata',adminController.Rejectprq)
adminRoutes.put('/acceptdata',adminController.Acceptprq)
adminRoutes.get('/partnerdata',adminController.findPartners)
adminRoutes.put('/partnerstatus',adminController.blockpartner)

module.exports=adminRoutes