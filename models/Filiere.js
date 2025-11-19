const mongoose = require('mongoose');

const filiereSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Pas deux fois "IGL"
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['BTS', 'LMD'], // On verrouille ces deux types
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Filiere', filiereSchema);