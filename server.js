const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');
const userRoutes = require('./routes/userRoutes');
// On met à jour l'importation pour refléter le renommage
const assetRoutes = require('./routes/assetRoutes'); 

dotenv.config();
configureCloudinary();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API LokoLearn en fonctionnement...');
});

app.use('/api/users', userRoutes);
// On utilise la nouvelle variable pour plus de clarté
app.use('/api/upload', assetRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Serveur démarré sur le port ${PORT}`));