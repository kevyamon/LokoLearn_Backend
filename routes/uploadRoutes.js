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

// Config Multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// --- ROUTES ---

// 1. Upload Cours (Prof seulement)
router.post('/', protect, professor, upload.single('file'), uploadFile);

// 2. Gestion Bannière (Admin ou Prof, à ajuster)
// Note: getBannerImages est public pour que la page d'accueil l'affiche
router.get('/banner', getBannerImages);
router.post('/banner', protect, professor, upload.single('image'), uploadBannerImage);
router.delete('/banner/:id', protect, professor, deleteBannerImage);

module.exports = router;