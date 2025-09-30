const { Server } = require('socket.io');

let io;

const initSocket = (httpServer, frontendURL) => {
  io = new Server(httpServer, {
    cors: {
      origin: frontendURL,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Un utilisateur est connecté: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`L'utilisateur ${socket.id} est déconnecté`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io n'est pas initialisé !");
  }
  return io;
};

module.exports = { initSocket, getIO };