// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/models/Course.js
const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
  },
  
  // MODIFICATION CRITIQUE : On passe en String (Texte libre)
  // car on a remplacé les IDs par des champs texte dans le frontend
  subject: {
    type: String, 
    required: true
  },
  filiere: {
    type: String,
    required: true
  },
  
  // L'auteur reste une référence (ID) car c'est un utilisateur du système
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Classement
  level: {
    type: String, // "L1", "L2", "BTS 1", etc.
    required: true
  },
  type: {
    type: String,
    enum: ['COURS', 'TP', 'TD', 'EXAMEN'], 
    default: 'COURS'
  },

  // Le Fichier (Cloudinary)
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String, 
    required: true
  },
  fileSize: {
    type: String 
  },

  // Stats
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);