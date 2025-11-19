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

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// --- CONFIGURATION CORS ULTRA-PERMISSIVE (Pour réparer l'erreur) ---
// On autorise explicitement ton frontend local et la version prod si elle existe
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  process.env.FRONTEND_URL // Si défini sur Render
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && !origin.includes('render.com')) {
            // Si l'origine n'est pas dans la liste, on accepte quand même pour le dev (optionnel, ou on bloque)
            // Pour le débogage actuel, on accepte tout :
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
        origin: "*", // On ouvre Socket.io aussi
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Test simple pour voir si le serveur répond
app.get('/', (req, res) => {
    res.status(200).send('API LokoLearn en ligne 🚀');
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));