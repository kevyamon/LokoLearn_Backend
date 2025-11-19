// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  checkMatricule, 
  registerStudent, 
  loginStudent,
  registerAdmin,
  loginAdmin
} = require('../controllers/userController');

// Routes Étudiant
router.post('/check', checkMatricule);
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Routes Admin (Cachées)
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

module.exports = router;