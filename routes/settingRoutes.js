const express = require('express');
const router = express.Router();
const { getProfCode, updateProfCode } = require('../controllers/settingsController');
const { protect, professor } = require('../middleware/authMiddleware');

// Seul un ADMIN (ici professor/admin role) peut toucher à ça
// Note : Assure-toi que ton middleware 'professor' laisse passer les admins, 
// ou crée un middleware 'adminOnly'. Pour l'instant 'professor' inclut admin dans ton code.

router.get('/prof-code', protect, professor, getProfCode);
router.put('/prof-code', protect, professor, updateProfCode);

module.exports = router;