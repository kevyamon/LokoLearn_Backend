// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/courseController.js
const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary'); // IMPORT CLOUDINARY

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

// 2. LIRE LES COURS (inchangé)
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

// 3. GÉNÉRER UNE URL SIGNÉE POUR LE TÉLÉCHARGEMENT (CORRECTION)
const getSignedFileUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    // Extraction robuste du public ID
    // 1. On cherche la partie de l'URL qui commence après 'upload/'
    const urlParts = course.fileUrl.split('/upload/');
    if (urlParts.length < 2) {
        return res.status(500).json({ message: "URL Cloudinary invalide (Format attendu non trouvé)." });
    }

    // Le 'fileIdentifier' doit inclure le chemin complet après /upload/ (y compris le v<version>/)
    const fileIdentifier = urlParts[1]; 
    
    // On doit s'assurer qu'il s'agit d'un fichier 'raw' pour les signatures de téléchargement de documents
    const signedUrl = cloudinary.utils.signed_download_url(fileIdentifier, {
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // Valide 1 heure
        resource_type: 'raw' // CRITIQUE pour que la signature soit appliquée au bon type de fichier
    });

    res.json({ signedUrl });

  } catch (error) {
    console.error("Erreur génération URL signée:", error);
    // On renvoie un message générique si l'erreur vient d'un mauvais secret (500)
    res.status(500).json({ message: 'Erreur serveur lors de la tentative de signature. Vérifiez votre API_SECRET Cloudinary.' });
  }
};

// --- Les autres fonctions restent inchangées ---

const getProfStats = async (req, res) => {
// ... (reste du code inchangé)
};

const updateCourse = async (req, res) => {
// ... (reste du code inchangé)
};

const deleteCourse = async (req, res) => {
// ... (reste du code inchangé)
};

const incrementView = async (req, res) => {
// ... (reste du code inchangé)
};

const getCourseFormData = async (req, res) => { res.json({ filieres: [], subjects: [] }); };

module.exports = { 
  createCourse, getCourses, getProfStats, updateCourse, deleteCourse, incrementView, getCourseFormData, getSignedFileUrl
};