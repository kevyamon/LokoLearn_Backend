const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes'); // <--- Ajouté
const uploadRoutes = require('./routes/uploadRoutes'); // <--- Ajouté

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.io
const io = new Server(server, {
    cors: { origin: "*" }
});
require('./socket/socketManager')(io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes); // <--- Route Cours
app.use('/api/upload', uploadRoutes);   // <--- Route Upload

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));