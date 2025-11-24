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
      
      // CAS 1 : Utilisateur non trouvé dans la DB mais token valide
      if (!req.user) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur inexistant' });
      }

      next();
    } catch (error) {
      // CAS 2 : Erreur de vérification JWT (token expiré, invalide)
      console.error('Erreur JWT/Auth:', error.message);
      return res.status(401).json({ message: 'Non autorisé, token invalide ou expiré' });
    }
  } else {
    // CAS 3 : Pas de token dans l'en-tête
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }

  // Si pour une raison inconnue le flux arrive ici sans token et sans erreur, on force le 401
  if (!token) {
    // Cette ligne est théoriquement déjà couverte par le 'else' plus haut, 
    // mais je la laisse pour la robustesse.
    // On doit utiliser 'return' ici pour éviter que 'next()' ne soit appelé
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour vérifier si c'est un professeur ou admin
const professor = (req, res, next) => {
  // Le middleware 'protect' doit avoir déjà inséré req.user
  if (req.user && (req.user.role === 'professor' || req.user.role === 'admin')) {
    next();
  } else {
    // Si req.user n'est pas défini (car protect a planté) ou si le rôle est mauvais
    res.status(401).json({ message: 'Accès réservé aux professeurs' });
  }
};

module.exports = { protect, professor };