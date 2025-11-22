// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createCourse, 
  getCourses, 
  getCourseFormData, 
  incrementView,
  getProfStats,
  updateCourse, // Import
  deleteCourse  // Import
} = require('../controllers/courseController');
const { protect, professor } = require('../middleware/authMiddleware');

// Publique
router.get('/', getCourses);
router.put('/:id/view', incrementView);

// Protégé (Prof)
router.get('/form-data', protect, getCourseFormData); 
router.get('/my-stats', protect, professor, getProfStats);
router.post('/', protect, professor, createCourse);

// NOUVELLES ROUTES DE GESTION (Modification / Suppression)
router.route('/:id')
    .put(protect, professor, updateCourse)
    .delete(protect, professor, deleteCourse);

module.exports = router;