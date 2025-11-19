// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/settingsController.js
const SystemSetting = require('../models/SystemSetting');

// 1. RÉCUPÉRER LE CODE (Pour l'affichage Admin)
const getProfCode = async (req, res) => {
  try {
    let setting = await SystemSetting.findOne({ key: 'PROF_REGISTRATION_CODE' });
    
    // Si le code n'existe pas encore, on en crée un par défaut
    if (!setting) {
      setting = await SystemSetting.create({
        key: 'PROF_REGISTRATION_CODE',
        value: 'LOKO-PROF-2024', // Valeur par défaut
        description: "Code requis pour l'inscription des professeurs"
      });
    }
    
    res.json({ code: setting.value });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération code." });
  }
};

// 2. METTRE À JOUR LE CODE (Action Admin)
const updateProfCode = async (req, res) => {
  const { newCode } = req.body;

  if (!newCode || newCode.length < 4) {
    return res.status(400).json({ message: "Le code est trop court." });
  }

  try {
    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'PROF_REGISTRATION_CODE' },
      { value: newCode },
      { new: true, upsert: true } // Crée si n'existe pas
    );
    res.json({ message: "Code mis à jour avec succès", code: setting.value });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};

module.exports = { getProfCode, updateProfCode };