const express = require('express')
const app = express()
const path = require('path');


const http = require('http');
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {
  socket.on("send-location", (data) => { // Receive location from client
    io.emit("receive-location", { id: socket.id, ...data }); // Broadcast to all clients
  });
  console.log("Connected");
  socket.on("disconnect", (data) => {
    io.emit("user-disconnected", socket.id);
    console.log("Disconnected");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
