// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer un token
// (Si tu as un fichier utils/generateToken.js, tu peux l'importer à la place, mais ceci est autonome)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. VÉRIFIER LE MATRICULE (Avant de demander le mot de passe)
// @route POST /api/users/check
const checkMatricule = async (req, res) => {
  const { matricule } = req.body;

  // Regex Stricte (Format 12345-M1)
  const matriculeRegex = /^\d{5}-M\d$/;

  if (!matricule || !matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format invalide. Exemple attendu : 12345-M1" });
  }

  try {
      const user = await User.findOne({ matricule });
      
      if (user) {
        // Le compte existe déjà -> On demandera le mot de passe
        res.json({ exists: true });
      } else {
        // Le compte est libre -> On proposera de le créer
        res.json({ exists: false });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }
};

// 2. INSCRIRE UN ÉTUDIANT (Premier arrivé)
// @route POST /api/users/register
const registerStudent = async (req, res) => {
  const { matricule, password } = req.body;

  // Double sécurité Regex
  const matriculeRegex = /^\d{5}-M\d$/;
  if (!matricule || !matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format matricule invalide." });
  }

  try {
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
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: "Données invalides" });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

// 3. CONNECTER UN ÉTUDIANT
// @route POST /api/users/login
const loginStudent = async (req, res) => {
  const { matricule, password } = req.body;

  try {
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
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

// 4. INSCRIRE UN ADMIN (Avec Clé Secrète)
// @route POST /api/users/admin/register
const registerAdmin = async (req, res) => {
  const { email, phoneNumber, password, adminKey } = req.body;

  // Vérification de la CLÉ MAÎTRESSE
  if (adminKey !== process.env.ADMIN_PASS) {
    // Petit délai pour empêcher le brute-force rapide
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.status(403).json({ message: "Clé Admin invalide." });
  }

  // Vérification Force Mot de Passe (Min 8, 1 chiffre, 1 spécial)
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({ message: "Le mot de passe doit contenir 8 caractères, 1 chiffre et 1 caractère spécial." });
  }

  try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: "Cet email est déjà utilisé." });

      const user = await User.create({
        email,
        phoneNumber,
        password,
        role: 'admin', // Rôle Admin
        isVerified: true
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: "Administrateur",
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: "Erreur création admin" });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur." });
  }
};

// 5. CONNECTER UN ADMIN
// @route POST /api/users/admin/login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });

      if (user && (await user.matchPassword(password))) {
        // Vérification critique du rôle
        if (user.role !== 'admin') {
          return res.status(403).json({ message: "Accès refusé. Ce n'est pas un compte Admin." });
        }

        res.json({
          _id: user._id,
          name: user.name || "Admin",
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Identifiants incorrects" });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur." });
  }
};

// Alias pour compatibilité si d'autres fichiers appellent loginUser
const loginUser = loginStudent;

module.exports = { 
  checkMatricule, 
  registerStudent, 
  loginStudent, 
  registerAdmin, 
  loginAdmin,
  loginUser 
};