// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingRoutes = require('./routes/settingRoutes'); // NOUVEAU

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// --- CONFIGURATION CORS ---
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && !origin.includes('render.com')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// --- SOCKET.IO CONFIGURATION ---
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Test simple
app.get('/', (req, res) => {
    res.status(200).send('API LokoLearn en ligne 🚀');
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes); // NOUVEAU : Activation des settings

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));