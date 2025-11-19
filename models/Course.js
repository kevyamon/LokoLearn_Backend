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
  
  // Relations
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  filiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Filiere',
    required: true
  },
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
    enum: ['COURS', 'TP', 'TD', 'EXAMEN'], // Catégorie du document
    default: 'COURS'
  },

  // Le Fichier (Cloudinary)
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String, // "pdf", "docx", "pptx"
    required: true
  },
  fileSize: {
    type: String // "2.5 MB" (Pour info utilisateur)
  },

  // Stats & Gamification
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