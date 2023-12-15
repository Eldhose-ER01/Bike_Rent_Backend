const mongoose = require('mongoose');
const express=require('express')
const app=express()
const userRoute = require('./routes/User')
const adminRoute=require('./routes/Admin')
const partnerRoute=require('./routes/Partner')
const cors=require('cors')
const path = require('path')


app.use(cors())
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('public'));
app.set('views', path.join(__dirname, '/views'));
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