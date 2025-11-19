// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  checkMatricule, 
  registerStudent, 
  loginStudent 
} = require('../controllers/userController');

// Route pour vérifier l'état du matricule (Existe ou pas ?)
router.post('/check', checkMatricule);

// Route pour créer le compte (Premier login)
router.post('/register', registerStudent);

// Route pour se connecter (Retours suivants)
router.post('/login', loginStudent);

module.exports = router;