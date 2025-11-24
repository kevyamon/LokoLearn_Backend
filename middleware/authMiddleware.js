// kevyamon/lokolearn_backend/LokoLearn_Backend-a0fd204aec523b4df8e33ff9859b4f62884cac3e/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Récupérer le token du header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur associé au token (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur introuvable.' });
      }

      // Tout est OK, on passe à la suite
      return next(); 

    } catch (error) {
      console.error('Erreur Auth:', error.message);
      return res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, aucun token fourni.' });
  }
};

// Middleware pour vérifier si c'est un professeur ou admin
const professor = (req, res, next) => {
  if (req.user && (req.user.role === 'professor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé : Réservé aux professeurs.' });
  }
};

module.exports = { protect, professor };