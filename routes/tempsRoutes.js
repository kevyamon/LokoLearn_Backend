const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadBannerImage, 
  getBannerImages,
  deleteBannerImage 
} = require('../controllers/uploadController');

// On configure Multer pour stocker temporairement le fichier en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes pour récupérer les images et en ajouter une nouvelle
router.route('/banner')
  .post(upload.single('image'), uploadBannerImage)
  .get(getBannerImages);

// Route pour supprimer une image par son ID
router.route('/banner/:id').delete(deleteBannerImage);

module.exports = router;