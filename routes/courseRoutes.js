// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createCourse, 
  getCourses, 
  getCourseFormData, 
  incrementView,
  getProfStats 
} = require('../controllers/courseController');
const { protect, professor } = require('../middleware/authMiddleware');

// Publique : Lire les cours et Incrémenter vue
router.get('/', getCourses);
router.put('/:id/view', incrementView); // N'importe qui peut voir un cours (pour l'instant)

// Protégé (Prof)
router.get('/form-data', protect, getCourseFormData); 
router.get('/my-stats', protect, professor, getProfStats); // <--- Stats Dashboard
router.post('/', protect, professor, createCourse);

module.exports = router;