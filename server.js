const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const configureCloudinary = require('./config/cloudinary');
const userRoutes = require('./routes/userRoutes');
// Le chemin avec la bonne majuscule
const uploadRoutes = require('./routes/uploadroutes'); 

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
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Serveur démarré sur le port ${PORT}`));