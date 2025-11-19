// controllers/courseController.js
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Filiere = require('../models/Filiere');

// @desc    Créer un nouveau cours
const createCourse = async (req, res) => {
  try {
    const { 
      title, description, subject, filiere, 
      level, type, fileUrl, fileType, fileSize 
    } = req.body;

    if (!title || !subject || !filiere || !fileUrl) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    const course = await Course.create({
      title, description, subject, filiere, level, type, 
      fileUrl, fileType, fileSize,
      author: req.user._id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// @desc    Récupérer les cours (Avec Filtres Intelligents)
// @route   GET /api/courses?level=L1&subject=...
const getCourses = async (req, res) => {
  try {
    const { level, subject, filiere } = req.query;
    
    // Construction dynamique du filtre
    let query = {};
    if (level) query.level = level;
    if (subject) query.subject = subject;
    if (filiere) query.filiere = filiere;

    // On récupère les cours + les infos de l'auteur et de la matière
    const courses = await Course.find(query)
      .populate('author', 'name')
      .populate('subject', 'name')
      .sort({ createdAt: -1 }); // Les plus récents en premier

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération cours.' });
  }
};

// @desc    Incrémenter le compteur de vues/téléchargements
// @route   PUT /api/courses/:id/view
const incrementView = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1, downloads: 1 } }, // On augmente les compteurs
      { new: true }
    );
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Erreur tracking.' });
  }
};

// @desc    Données pour le formulaire
const getCourseFormData = async (req, res) => {
  try {
    const filieres = await Filiere.find({}).select('name _id type');
    const subjects = await Subject.find({}).select('name _id hasTP filieres levels');
    res.json({ filieres, subjects });
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement données.' });
  }
};

// @desc    Statistiques pour le Professeur (Dashboard)
// @route   GET /api/courses/my-stats
const getProfStats = async (req, res) => {
  try {
    // On cherche tous les cours de ce prof
    const myCourses = await Course.find({ author: req.user._id });
    
    const totalCourses = myCourses.length;
    // On additionne les vues de tous les cours
    const totalViews = myCourses.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalDownloads = myCourses.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

    res.json({
      totalCourses,
      totalViews,
      totalDownloads,
      recentCourses: myCourses.slice(0, 5) // Les 5 derniers
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur stats.' });
  }
};

module.exports = { 
  createCourse, 
  getCourses, 
  incrementView, 
  getCourseFormData,
  getProfStats 
};