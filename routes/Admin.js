const express=require('express')
const adminRoutes=express()
const middleware=require('../middleware/Auth')
const adminController=require('../controller/AdminController')


/*------------------------Login in Admin---------------------------------------*/
adminRoutes.post('/login',adminController.Adminlogin)
/*--------------Total Users and Block And Un block------------------------*/
adminRoutes.get('/userlist',adminController.LoadUser)
adminRoutes.put('/statuschange',adminController.Blockuser)
/*----------------------Partner Details and Change request----------------*/
adminRoutes.get('/partnerreq',adminController.Partnerdata)
adminRoutes.put('/rejectdata',adminController.Rejectprq)
adminRoutes.get('/rejectlist',adminController.Rejectlist)
adminRoutes.put('/acceptdata',adminController.Acceptprq)
adminRoutes.get('/partnerdata',adminController.FindPartners)
adminRoutes.put('/partnerstatus',adminController.Blockpartner)
adminRoutes.post('/checkisadmin',middleware.adminAuth)
/*--------------------Partner View All Bikes And Requests---------------------*/
adminRoutes.get('/bikerequest',adminController.Bikerequest)
adminRoutes.put('/acceptbike',adminController.BikeAccept)
adminRoutes.put('/rejectbike',adminController.RejectAccept)
adminRoutes.post('/bikepartnerlist',adminController.PartnerBikeView)
adminRoutes.put('/blockbike',adminController.Blockbike)
adminRoutes.get('/checkifadmin',adminController.CheckifAdmin)
adminRoutes.get('/bikerequstview',adminController.viewRequest)
/*------------------Admin Upload Coupon and block or unblock------------------*/
adminRoutes.post('/coupon',adminController.Coupons)
adminRoutes.get('/findcoupon',adminController.findcoupon)
adminRoutes.post('/blockcoupon',adminController.blockcoupon)
/*------------------------Admin view the Sales report And Chat------------------*/
adminRoutes.get('/chartview',adminController.ChartView)
adminRoutes.get('/adminsales',adminController.AdminSales)



module.exports=adminRoutes