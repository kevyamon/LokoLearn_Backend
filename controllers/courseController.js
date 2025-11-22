// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/courseController.js
const Course = require('../models/Course');

// 1. CRÉER UN COURS
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
    console.error("Erreur création cours:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 2. LIRE LES COURS (Public + Filtres)
const getCourses = async (req, res) => {
  try {
    const { level, subject, filiere } = req.query;
    let query = {};
    if (level) query.level = level;
    if (subject) query.subject = subject;
    if (filiere) query.filiere = filiere;

    const courses = await Course.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération cours.' });
  }
};

// 3. STATS PROF + LISTE COMPLÈTE (Privé)
const getProfStats = async (req, res) => {
  try {
    // On récupère TOUS les cours du prof connecté
    const myCourses = await Course.find({ author: req.user._id }).sort({ createdAt: -1 });
    
    const totalCourses = myCourses.length;
    const totalViews = myCourses.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalDownloads = myCourses.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

    res.json({
      totalCourses,
      totalViews,
      totalDownloads,
      allCourses: myCourses, // On renvoie la liste complète ici
      recentCourses: myCourses.slice(0, 5) // Et les 5 derniers pour le dashboard
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur stats.' });
  }
};

// 4. MODIFIER UN COURS (NOUVEAU)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Cours introuvable." });

    // Vérifier que c'est bien le prof propriétaire
    if (course.author.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Non autorisé." });
    }

    // Mise à jour (On ne touche pas au fichier pour l'instant, juste les infos)
    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.subject = req.body.subject || course.subject;
    course.level = req.body.level || course.level;

    const updatedCourse = await course.save();
    res.json(updatedCourse);

  } catch (error) {
    res.status(500).json({ message: "Erreur modification." });
  }
};

// 5. SUPPRIMER UN COURS (NOUVEAU)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ message: "Cours introuvable." });

    // Vérifier que c'est bien le prof propriétaire
    if (course.author.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Non autorisé." });
    }

    // Suppression physique
    await course.deleteOne();
    res.json({ message: "Cours supprimé avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur suppression." });
  }
};

// 6. COMPTEUR VUES
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

// 7. DATA FORMULAIRE
const getCourseFormData = async (req, res) => {
    res.json({ filieres: [], subjects: [] });
};

module.exports = { 
  createCourse, getCourses, getProfStats, 
  updateCourse, deleteCourse, // <-- Export des nouvelles fonctions
  incrementView, getCourseFormData 
};