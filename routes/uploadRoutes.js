// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');
const { protect, professor } = require('../middleware/authMiddleware'); // Assure-toi que ces middlewares existent

// Configuration Multer (Stockage en mémoire temporaire)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite à 10 MB (Ajustable)
});

// Route Upload
router.post('/', protect, professor, upload.single('file'), uploadFile);

module.exports = router;