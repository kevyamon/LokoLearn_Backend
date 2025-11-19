// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/models/SystemSetting.js
const mongoose = require('mongoose');

const systemSettingSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // Ex: 'PROF_REGISTRATION_CODE'
    uppercase: true
  },
  value: {
    type: String,
    required: true
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);