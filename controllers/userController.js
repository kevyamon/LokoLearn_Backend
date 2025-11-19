// controllers/userController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // Assure-toi que ce fichier existe (généralement utils/generateToken.js)
// Si tu n'as pas de fichier utils/generateToken.js, je peux utiliser jwt direct ici, mais c'est mieux de séparer.
// Pour l'instant, je vais utiliser une génération simple ici si le fichier n'existe pas, 
// ou supposer qu'il est là vu qu'on a fait l'espace prof.
const jwt = require('jsonwebtoken');

const generateTokenDirect = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. VÉRIFIER LE MATRICULE (Avant de demander le mot de passe)
// @route POST /api/users/check
const checkMatricule = async (req, res) => {
  const { matricule } = req.body;

  // Restauration de TA Regex Stricte (Format 12345-M1)
  const matriculeRegex = /^\d{5}-M\d$/;

  if (!matricule || !matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format invalide. Exemple attendu : 12345-M1" });
  }

  const user = await User.findOne({ matricule });
  
  if (user) {
    // Le compte existe déjà -> On demandera le mot de passe
    res.json({ exists: true });
  } else {
    // Le compte est libre -> On proposera de le créer
    res.json({ exists: false });
  }
};

// 2. INSCRIRE UN ÉTUDIANT (Premier arrivé)
// @route POST /api/users/register-student
const registerStudent = async (req, res) => {
  const { matricule, password } = req.body;

  // Double sécurité Regex
  const matriculeRegex = /^\d{5}-M\d$/;
  if (!matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format matricule invalide." });
  }

  const userExists = await User.findOne({ matricule });
  if (userExists) {
    return res.status(400).json({ message: "Ce matricule est déjà activé. Connectez-vous." });
  }

  const user = await User.create({
    matricule,
    password, // Sera hashé par le modèle User
    role: 'student',
    isVerified: true // On considère qu'un étudiant avec un matricule valide est vérifié
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      matricule: user.matricule,
      role: user.role,
      token: generateTokenDirect(user._id),
    });
  } else {
    res.status(400).json({ message: "Données invalides" });
  }
};

// 3. CONNECTER UN ÉTUDIANT
// @route POST /api/users/login-student
const loginStudent = async (req, res) => {
  const { matricule, password } = req.body;

  const user = await User.findOne({ matricule });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      matricule: user.matricule,
      role: user.role,
      token: generateTokenDirect(user._id),
    });
  } else {
    res.status(401).json({ message: "Matricule ou mot de passe incorrect" });
  }
};

// On garde l'ancienne fonction loginUser au cas où, ou pour l'admin
// Mais on va privilégier les nouvelles.
const loginUser = loginStudent; 

module.exports = { checkMatricule, registerStudent, loginStudent, loginUser };