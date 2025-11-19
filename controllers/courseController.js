// controllers/courseController.js
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Filiere = require('../models/Filiere');

// @desc    Créer un nouveau cours
// @route   POST /api/courses
// @access  Private (Prof)
const createCourse = async (req, res) => {
  try {
    const { 
      title, description, subject, filiere, 
      level, type, fileUrl, fileType, fileSize 
    } = req.body;

    // Validation basique
    if (!title || !subject || !filiere || !fileUrl) {
      return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires et uploader un fichier.' });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      filiere,
      level,
      type,
      fileUrl,
      fileType,
      fileSize,
      author: req.user._id // L'auteur est l'utilisateur connecté (Middleware protect requis)
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du cours.' });
  }
};

// @desc    Récupérer les données pour le formulaire (Filières, Matières)
// @route   GET /api/courses/form-data
const getCourseFormData = async (req, res) => {
  try {
    const filieres = await Filiere.find({}).select('name _id type');
    const subjects = await Subject.find({}).select('name _id hasTP filieres levels');
    res.json({ filieres, subjects });
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement données.' });
  }
};

module.exports = { createCourse, getCourseFormData };