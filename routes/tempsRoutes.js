const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadBannerImage, getBannerImages } = require('../controllers/uploadController');

// On configure Multer pour stocker temporairement le fichier en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/banner').post(upload.single('image'), uploadBannerImage).get(getBannerImages);

module.exports = router;