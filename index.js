const mongoose = require('mongoose');
const express=require('express')
const app=express()
const userRoute = require('./routes/UserRouts')
const adminRoute=require('./routes/AdminRoutes')
const partnerRoute=require('./routes/PartnerRoutes')
const cors=require('cors')


app.use(cors())
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded())

app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('/partner',partnerRoute)


mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("DB connected");
})
app.use(cors({
    orgin:'http://localhost:3000',
    methods:['GET','POST','PATCH','PUT']
}))



app.listen(8080,()=>{
    console.log("port working");
})