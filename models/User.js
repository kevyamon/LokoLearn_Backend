const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // On s'assure d'utiliser bcryptjs

const userSchema = mongoose.Schema({
  // Champs communs
  name: { type: String }, // Nom complet (surtout pour les profs)
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student'
  },
  
  // Spécifique Étudiant
  matricule: {
    type: String,
    unique: true,
    sparse: true // Permet d'avoir des profs sans matricule (null)
  },

  // Spécifique Professeur
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    // Requis seulement si c'est un prof ou admin (on gérera ça dans le contrôleur)
  },
  phoneNumber: { type: String },
  
  // Sécurité Prof : Est-ce que l'admin a validé ce compte ?
  isVerified: {
    type: Boolean,
    default: false 
  }
}, {
  timestamps: true
});

// Méthode pour vérifier le mot de passe (pour les profs)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encryptage avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);