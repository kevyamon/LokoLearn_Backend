// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  checkMatricule, 
  registerStudent, 
  loginStudent,
  registerProf,   // Nouveau
  loginProf,      // Nouveau
  registerAdmin,
  loginAdmin
} = require('../controllers/userController');

// Routes Étudiant
router.post('/check', checkMatricule);
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Routes Professeur (NOUVEAU)
router.post('/prof/register', registerProf);
router.post('/prof/login', loginProf);

// Routes Admin
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

module.exports = router;