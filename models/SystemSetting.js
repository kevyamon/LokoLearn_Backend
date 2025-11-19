// models/SystemSetting.js
const mongoose = require('mongoose');

const systemSettingSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
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