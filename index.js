// const mongoose = require('mongoose');
// const express=require('express')
// const app=express()
// const {Server}=require('socket.io')
// const userRoute = require('./routes/User')
// const adminRoute=require('./routes/Admin')
// const partnerRoute=require('./routes/Partner')
// const http = require ('http')
// // const chatroute=require('./routes/Chat')
// const cors=require('cors')
// const path = require('path')


// app.use(cors())
// require('dotenv').config()
// app.use(express.json())
// app.use(express.urlencoded())
// app.use(express.static('public'));
// app.set('views', path.join(__dirname, '/views'));
// app.use('/',userRoute)
// app.use('/admin',adminRoute)
// app.use('/partner',partnerRoute)
// // app.use('/chat',chatroute)


// mongoose.connect(process.env.DATABASE).then(()=>{
//     console.log("DB connected");
// })
// app.use(cors({
//     orgin:'http://localhost:3000',
//     methods:['GET','POST','PATCH','PUT']
// }))


// const server=http.createServer(app)

// const io = new Server(server, {
//     cors: {
//         origin: (origin, callback) => {
//             callback(null, origin === "http://localhost:3000");
//         },
//         credentials: true,
//     },
// });

// io.on("connection", (socket) => {
//     console.log("A user connected");

//     // Check if the socket is connected
//     if (socket.connected) {
//         console.log("Socket is connected");
//     } else {
//         console.log("Socket is not connected");
//     }
//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });

//     socket.on("sentMessage", async () => {
//         console.log(
//             "Connection is on-------------------------------------------------------------"
//         );
//         io.emit("receiveMessage");
//     });
// });

// app.listen(8080,()=>{
//     console.log("port working");
// })













const mongoose = require('mongoose');
const express = require('express');
const app = express();
const { Server } = require('socket.io');
const userRoute = require('./routes/User');
const adminRoute = require('./routes/Admin');
const partnerRoute = require('./routes/Partner');
const http = require('http');
const cors = require('cors');
const path = require('path');

app.use(cors()); // Remove the duplicate cors middleware
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Specify extended option
app.use(express.static('public'));
app.set('views', path.join(__dirname, '/views'));
app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/partner', partnerRoute);

mongoose.connect(process.env.DATABASE).then(() => {
    console.log("DB connected");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: false,
    },
});

io.on("connection", (socket) => {
    console.log("A user connected");

    // Check if the socket is connected
    if (socket.connected) {
        console.log("Socket is connected");
    } else {
        console.log("Socket is not connected");
    }

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    socket.on("sentMessage", async () => {
        console.log("Connection is on-------------------------------------------------------------");
        io.emit("receiveMessage");
    });

    // Add error handling
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
