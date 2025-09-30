const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // 1. Import du module http natif
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');
const { initSocket } = require('./socket/socketManager'); // 2. Import de notre gestionnaire
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');

dotenv.config();
configureCloudinary();
connectDB();

const app = express();
const server = http.createServer(app); // 3. Création du serveur HTTP à partir de l'app Express

// 4. Initialisation de Socket.IO
const io = initSocket(server, process.env.FRONTEND_URL);

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API LokoLearn en fonctionnement...');
});

app.use('/api/users', userRoutes);
app.use('/api/upload', assetRoutes);

const PORT = process.env.PORT || 5000;

// 5. On écoute sur le serveur HTTP et non plus sur l'app Express directement
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));