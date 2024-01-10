const express=require('express')
const adminRoutes=express()
const middleware=require('../middleware/Auth')
const adminController=require('../controller/AdminController')

adminRoutes.post('/login',adminController.Adminlogin)
adminRoutes.get('/userlist',adminController.LoadUser)
adminRoutes.put('/statuschange',adminController.Blockuser)
adminRoutes.get('/partnerreq',adminController.Partnerdata)
adminRoutes.put('/rejectdata',adminController.Rejectprq)
adminRoutes.get('/rejectlist',adminController.Rejectlist)
adminRoutes.put('/acceptdata',adminController.Acceptprq)
adminRoutes.get('/partnerdata',adminController.FindPartners)
adminRoutes.put('/partnerstatus',adminController.Blockpartner)
adminRoutes.post('/checkisadmin',middleware.adminAuth)
adminRoutes.get('/bikerequest',adminController.Bikerequest)
adminRoutes.put('/acceptbike',adminController.BikeAccept)
adminRoutes.put('/rejectbike',adminController.RejectAccept)
adminRoutes.post('/bikepartnerlist',adminController.PartnerBikeView)
adminRoutes.put('/blockbike',adminController.Blockbike)
adminRoutes.get('/checkifadmin',adminController.CheckifAdmin)
adminRoutes.get('/bikerequstview',adminController.viewRequest)
adminRoutes.post('/coupon',adminController.Coupons)
adminRoutes.get('/findcoupon',adminController.findcoupon)
adminRoutes.post('/blockcoupon',adminController.blockcoupon)
adminRoutes.get('/chartview',adminController.ChartView)
adminRoutes.get('/adminsales',adminController.AdminSales)




module.exports=adminRoutes