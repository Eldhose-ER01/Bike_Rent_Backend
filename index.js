const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');  // Import http module
const { Server } = require('socket.io');
const userRoute = require('./routes/User');
const adminRoute = require('./routes/Admin');
const partnerRoute = require('./routes/Partner');
const path = require('path');

app.use(cors());
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, '/views'));
app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/partner', partnerRoute);

mongoose.connect(process.env.DATABASE).then(() => {
    console.log('DB connected');
});

const server = http.createServer(app); // Create an HTTP server

const io = new Server(server, {
    cors: {
        // origin:'http://localhost:3000',
        origin:'https://bikerunrider.vercel.app/',
        methods: ['GET', 'POST', 'PATCH', 'PUT'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');

    if (socket.connected) {
        console.log('Socket is connected');
    } else {
        console.log('Socket is not connected');
    }

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('sentMessage', async () => {
        io.emit('receiveMessage');
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
