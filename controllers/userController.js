// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/userController.js
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting'); // IMPORT IMPORTANT
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. VÉRIFIER LE MATRICULE (Étudiant)
const checkMatricule = async (req, res) => {
  const { matricule } = req.body;
  const matriculeRegex = /^\d{5}-M\d$/;

  if (!matricule || !matriculeRegex.test(matricule)) {
    return res.status(400).json({ message: "Format invalide. Exemple attendu : 12345-M1" });
  }

  try {
      const user = await User.findOne({ matricule });
      if (user) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur." });
  }
};

// 2. INSCRIRE UN ÉTUDIANT
const registerStudent = async (req, res) => {
  const { matricule, password } = req.body;

  try {
      const userExists = await User.findOne({ matricule });
      if (userExists) {
        return res.status(400).json({ message: "Matricule déjà activé." });
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
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur inscription." });
  }
};

// 3. CONNECTER UN ÉTUDIANT
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
        res.status(401).json({ message: "Identifiants incorrects" });
      }
  } catch (error) {
      res.status(500).json({ message: "Erreur connexion." });
  }
};

// 4. INSCRIRE UN PROFESSEUR (DYNAMIQUE)
const registerProf = async (req, res) => {
    const { name, email, password, code } = req.body;

    try {
        // 1. Récupérer le code actif depuis la DB
        let setting = await SystemSetting.findOne({ key: 'PROF_REGISTRATION_CODE' });
        
        // Fallback si la base est vide
        const activeCode = setting ? setting.value : 'LOKO-PROF-2024';

        // 2. Vérifier le code
        if (code.trim() !== activeCode.trim()) {
            return res.status(403).json({ message: "Code établissement invalide." });
        }

        // 3. Vérifier si l'email existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email déjà utilisé." });

        // 4. Créer le prof
        const user = await User.create({
            name,
            email,
            password,
            role: 'professor',
            isVerified: true
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error("Erreur registerProf:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 5. CONNECTER UN PROFESSEUR
const loginProf = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.role !== 'professor' && user.role !== 'admin') {
                return res.status(403).json({ message: "Ce compte n'est pas un compte professeur." });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 6. ADMIN : INSCRIPTION
const registerAdmin = async (req, res) => {
  const { email, password, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_PASS) return res.status(403).json({ message: "Clé Admin invalide." });

  try {
      const user = await User.create({ email, password, role: 'admin', isVerified: true });
      res.status(201).json({
          _id: user._id, name: "Admin", email: user.email, role: user.role, token: generateToken(user._id)
      });
  } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

// 7. ADMIN : CONNEXION (AVEC VÉRIFICATION KILL SWITCH)
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
      // VÉRIFICATION DU VERROUILLAGE DÉVELOPPEUR
      // Remplace 'superadmin@loko.com' par ton email exact de développeur
      if (email === 'superadmin@loko.com') { 
         const lockSetting = await SystemSetting.findOne({ key: 'DEV_ACCESS_LOCKED' });
         if (lockSetting && lockSetting.value === 'true') {
             return res.status(403).json({ message: "Accès développeur révoqué par l'administration." });
         }
      }

      const user = await User.findOne({ email });
      if (user && (await user.matchPassword(password)) && user.role === 'admin') {
        res.json({ _id: user._id, name: "Admin", email: user.email, role: user.role, token: generateToken(user._id) });
      } else { 
        res.status(401).json({ message: "Identifiants incorrects." }); 
      }
  } catch (error) { res.status(500).json({ message: "Erreur serveur." }); }
};

module.exports = { 
  checkMatricule, registerStudent, loginStudent, 
  registerProf, loginProf, 
  registerAdmin, loginAdmin 
};
