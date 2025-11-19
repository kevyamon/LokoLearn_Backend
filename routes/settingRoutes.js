// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const { getProfCode, updateProfCode, lockDevAccess, unlockDevAccess } = require('../controllers/settingsController');
const { protect, professor } = require('../middleware/authMiddleware');

// Routes protégées (Admin connecté)
router.get('/prof-code', protect, professor, getProfCode);
router.put('/prof-code', protect, professor, updateProfCode);
router.post('/lock-dev', protect, professor, lockDevAccess);

// Route Publique (Backdoor secrète pour déverrouiller)
router.post('/ghost-unlock', unlockDevAccess);

module.exports = router;