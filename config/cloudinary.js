// kevyamon/lokolearn_backend/LokoLearn_Backend-9ef5484a9bb9f7486f42e850171b4ef1b25f0389/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🛑 LOG TEMPORAIRE CRITIQUE 🛑
console.log("CLOUDINARY CONFIG LOADED. CHECKING SECRET STATUS:");
// N'affiche pas la clé complète, mais vérifie si elle existe et a une bonne longueur
const secretStatus = process.env.CLOUDINARY_API_SECRET ? 
    `Secret loaded. Length: ${process.env.CLOUDINARY_API_SECRET.length} chars` : 
    "🚨 SECRET IS EMPTY OR UNDEFINED 🚨";
console.log(secretStatus);
// 🛑 FIN DU LOG TEMPORAIRE 🛑

module.exports = cloudinary;