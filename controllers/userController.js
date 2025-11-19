const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fonction interne pour générer le token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// 1. VÉRIFIER LE MATRICULE
const checkMatricule = async (req, res) => {
  const { matricule } = req.body;
  const matriculeRegex = /^\d{5}-M\d$/;

  if (!matricule || !matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format invalide. Exemple attendu : 12345-M1" });
  }

  const user = await User.findOne({ matricule });
  
  if (user) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
};

// 2. INSCRIRE UN ÉTUDIANT
const registerStudent = async (req, res) => {
  const { matricule, password } = req.body;

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
    password,
    role: 'student',
    isVerified: true 
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      matricule: user.matricule,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Données invalides" });
  }
};

// 3. CONNECTER UN ÉTUDIANT
const loginStudent = async (req, res) => {
  const { matricule, password } = req.body;

  const user = await User.findOne({ matricule });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      matricule: user.matricule,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Matricule ou mot de passe incorrect" });
  }
};

const loginUser = loginStudent; 

module.exports = { checkMatricule, registerStudent, loginStudent, loginUser };