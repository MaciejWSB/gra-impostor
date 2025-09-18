const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const initializeSocket = require('./socketHandlers.js');

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Ta linia poprawnie udostępnia wszystko z folderu 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Inicjalizacja całej logiki Socket.IO
initializeSocket(io);

server.listen(PORT, () => {
    console.log(`🚀 Serwer gry nasłuchuje na porcie ${PORT}`);
});