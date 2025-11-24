// kevyamon/lokolearn_backend/LokoLearn_Backend-a0fd204aec523b4df8e33ff9859b4f62884cac3e/routes/uploadRoutes.js
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
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

// Middleware de gestion des erreurs Multer
const handleMulterError = (req, res, next) => {
    // La méthode Multer (upload.single('file')) est appelée directement dans la route ci-dessous.
    // L'erreur est gérée via le callback d'Express dans le routeur.
    next(); 
};


// --- ROUTES ---

// 1. Upload Cours (Prof seulement) avec gestion des erreurs Multer
router.post('/', protect, professor, (req, res, next) => {
    // On enveloppe l'appel Multer dans une fonction pour gérer son erreur
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Erreur Multer spécifique (ex: FILE_TOO_LARGE)
            return res.status(400).json({ message: "Fichier trop volumineux (Max 15MB)." });
        } else if (err) {
            // Autres erreurs (ex: Erreur système)
            console.error("Erreur Multer Inconnue:", err);
            return res.status(500).json({ message: "Erreur interne lors du traitement du fichier." });
        }
        // Si tout va bien, on passe au contrôleur
        next();
    });
}, uploadFile);


// 2. Gestion Bannière
router.get('/banner', getBannerImages);
router.post('/banner', protect, professor, upload.single('image'), uploadBannerImage);
router.delete('/banner/:id', protect, professor, deleteBannerImage);

module.exports = router;