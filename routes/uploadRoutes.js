// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadFile, 
  uploadBannerImage, 
  getBannerImages, 
  deleteBannerImage 
} = require('../controllers/uploadController');

const { protect, professor } = require('../middleware/authMiddleware');

// Config Multer (Mémoire tampon)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // Augmenté à 15 MB pour les gros PPT
});

// --- ROUTES ---

// 1. Upload Cours (Prof seulement)
// On accepte tout type de fichier ici, la validation se fera dans le contrôleur ou Cloudinary
router.post('/', protect, professor, upload.single('file'), uploadFile);

// 2. Gestion Bannière
router.get('/banner', getBannerImages);
router.post('/banner', protect, professor, upload.single('image'), uploadBannerImage);
router.delete('/banner/:id', protect, professor, deleteBannerImage);

module.exports = router;