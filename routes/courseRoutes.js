// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { createCourse, getCourseFormData } = require('../controllers/courseController');
const { protect, professor } = require('../middleware/authMiddleware'); // Assure-toi d'avoir ces middlewares

// Route publique ou protégée pour récupérer les infos du formulaire
router.get('/form-data', protect, getCourseFormData); 

// Route création de cours (Seul un prof connecté peut le faire)
router.post('/', protect, professor, createCourse);

module.exports = router;