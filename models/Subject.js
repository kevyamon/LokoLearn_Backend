const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Une matière appartient à une ou plusieurs filières (ex: Anglais peut être en IGL et RIT)
  filieres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Filiere'
  }],
  // Pour quels niveaux cette matière est dispo ? (ex: ["L1", "L2"])
  levels: [{
    type: String,
    required: true
  }],
  // LA CLÉ DU SUCCÈS : Est-ce que cette matière a des TPs ?
  hasTP: {
    type: Boolean,
    default: false, 
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);