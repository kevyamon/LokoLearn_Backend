// server.js (Backend)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes'); // <--- INDISPENSABLE (Mission 3)
const uploadRoutes = require('./routes/uploadRoutes'); // <--- INDISPENSABLE (Mission 4)

// (Optionnel) Si tu veux garder tes anciennes routes d'assets, garde la ligne ci-dessous, sinon supprime-la.
// const assetRoutes = require('./routes/assetRoutes'); 

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Configuration CORS (Accepte tout pour le dev, à restreindre en prod)
app.use(cors({
    origin: process.env.FRONTEND_URL || "*"
}));
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
    cors: { origin: "*" }
});
// Si tu as un socketManager, tu peux l'utiliser ici
// require('./socket/socketManager')(io);

// --- ROUTES API ---
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes); // Route pour créer/lire les cours
app.use('/api/upload', uploadRoutes);   // Route pour uploader les fichiers

// Route de base
app.get('/', (req, res) => {
    res.send('API LokoLearn opérationnelle 🚀');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));