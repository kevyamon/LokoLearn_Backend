// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/courseController.js
const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');

// Fonction utilitaire pour "Nettoyer" le nom (Normalisation)
const normalizeSubjectName = (name) => {
  if (!name) return '';
  const trimmed = name.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

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

    const cleanSubject = normalizeSubjectName(subject);

    const course = await Course.create({
      title, 
      description, 
      subject: cleanSubject, 
      filiere, 
      level, 
      type, 
      fileUrl, 
      fileType, 
      fileSize,
      author: req.user._id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("Erreur création cours:", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 2. LIRE LES COURS
const getCourses = async (req, res) => {
  try {
    const { level, subject, filiere } = req.query;
    let query = {};
    
    if (level) query.level = level;
    if (filiere) query.filiere = filiere;
    
    if (subject) query.subject = normalizeSubjectName(subject);

    const courses = await Course.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération cours.' });
  }
};

// 3. GÉNÉRER UNE URL SIGNÉE POUR LE TÉLÉCHARGEMENT (ULTIME CORRECTION)
const getSignedFileUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    // Extraction du Public ID SANS la version (v<...>) et SANS le type (raw/upload)
    // Cloudinary SDK préfère souvent l'identifiant simple pour le builder d'URL
    const parts = course.fileUrl.split('/');
    // L'ID du fichier est le dernier élément, y compris le dossier si présent
    const fullPublicId = parts.slice(parts.indexOf('lokolearn_cours') - 1).join('/');

    // Nettoyage de l'extension pour le public ID (si on utilise le builder de base)
    // On retire l'extension car le builder la gère.
    const publicIdWithoutExtension = course.fileUrl.substring(
        course.fileUrl.lastIndexOf('/') + 1, 
        course.fileUrl.lastIndexOf('.')
    );

    // 🏆 Solution ultime : utiliser cloudinary.url() avec le type 'authenticated' et l'extension.
    // Cette fonction est le moyen le plus direct de construire une URL signée.
    const signedUrl = cloudinary.url(publicIdWithoutExtension, {
        resource_type: 'raw', // On garde 'raw'
        type: 'authenticated', // On force le type 'authenticated' pour que la signature soit incluse
        format: course.fileType, // On inclut le format (pdf)
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60)
    });

    // LOGS DE VÉRIFICATION
    console.log("--- DEBUG CLOUDINARY SIGNATURE (ULTIME) ---");
    console.log("Public ID pour signature:", publicIdWithoutExtension);
    console.log("URL Signée Finale:", signedUrl);
    console.log("---------------------------------");
    
    res.json({ signedUrl });

  } catch (error) {
    console.error("Erreur critique de la fonction cloudinary.url():", error);
    // On prévient que le problème est très profond maintenant
    res.status(500).json({ 
        message: 'Échec irréversible de la signature Cloudinary. Veuillez vérifier la configuration de sécurité stricte de votre compte Cloudinary.' 
    });
  }
};


const getProfStats = async (req, res) => {
  try {
    const myCourses = await Course.find({ author: req.user._id }).sort({ createdAt: -1 });
    const totalCourses = myCourses.length;
    const totalViews = myCourses.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalDownloads = myCourses.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

    res.json({
      totalCourses, totalViews, totalDownloads,
      allCourses: myCourses, recentCourses: myCourses.slice(0, 5)
    });
  } catch (error) { res.status(500).json({ message: 'Erreur stats.' }); }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours introuvable." });
    if (course.author.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Non autorisé." });

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    if (req.body.subject) course.subject = normalizeSubjectName(req.body.subject);
    course.level = req.body.level || course.level;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) { res.status(500).json({ message: "Erreur modification." }); }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours introuvable." });
    if (course.author.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Non autorisé." });
    await course.deleteOne();
    res.json({ message: "Cours supprimé." });
  } catch (error) { res.status(500).json({ message: "Erreur suppression." }); }
};

const incrementView = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1, downloads: 1 } }, { new: true }
    );
    res.json(course);
  } catch (error) { res.status(500).json({ message: 'Erreur tracking.' }); }
};

const getCourseFormData = async (req, res) => { res.json({ filieres: [], subjects: [] }); };

module.exports = { 
  createCourse, getCourses, getProfStats, updateCourse, deleteCourse, incrementView, getCourseFormData, getSignedFileUrl
};