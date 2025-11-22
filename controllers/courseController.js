// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/courseController.js
const Course = require('../models/Course');
// On n'a plus besoin d'importer Subject et Filiere ici pour la création

// @desc    Créer un nouveau cours
const createCourse = async (req, res) => {
  try {
    const { 
      title, description, subject, filiere, 
      level, type, fileUrl, fileType, fileSize 
    } = req.body;

    // Validation simple
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
    console.error("Erreur création cours:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du cours.' });
  }
};

// @desc    Récupérer les cours (Avec Filtres)
const getCourses = async (req, res) => {
  try {
    const { level, subject, filiere } = req.query;
    
    // Construction dynamique du filtre
    let query = {};
    if (level) query.level = level;
    
    // Filtres souples (recherche partielle insensible à la casse si nécessaire)
    // Pour l'instant on fait une égalité stricte, mais comme c'est du texte, c'est simple
    if (subject) query.subject = subject;
    if (filiere) query.filiere = filiere;

    const courses = await Course.find(query)
      .populate('author', 'name') // On récupère juste le nom du prof
      // .populate('subject') -> RETIRÉ car subject est maintenant un String
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération cours.' });
  }
};

// @desc    Données pour le formulaire (Optionnel maintenant qu'on est en texte libre)
const getCourseFormData = async (req, res) => {
    // On garde cette fonction vide ou basique pour ne pas casser les appels existants
    // Mais le frontend n'utilise plus vraiment ces listes pour l'instant
    res.json({ filieres: [], subjects: [] });
};

// @desc    Incrémenter vue/download
const incrementView = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1, downloads: 1 } },
      { new: true }
    );
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Erreur tracking.' });
  }
};

// @desc    Stats Prof
const getProfStats = async (req, res) => {
  try {
    const myCourses = await Course.find({ author: req.user._id }).sort({ createdAt: -1 });
    
    const totalCourses = myCourses.length;
    const totalViews = myCourses.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalDownloads = myCourses.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

    res.json({
      totalCourses,
      totalViews,
      totalDownloads,
      recentCourses: myCourses.slice(0, 5)
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