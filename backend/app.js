const express = require('express')
const app = express()
const path = require('path');
const port = 3000

const http = require('http');
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

io.on("connection", (socket) => {
  socket.on("send-location", (data) => {
    io.emit("receive-location", { id: socket.id, ...data });
  });
  console.log("Connected");
  socket.on("disconnect", (data) => {
    io.emit("user-disconnected", socket.id);
    console.log("Disconnected");
  });
});

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
