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

// 3. GÉNÉRER UNE URL SIGNÉE POUR LE TÉLÉCHARGEMENT (CORRECTION FINALE)
const getSignedFileUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable." });
    }

    // 💡 Nouvelle logique robuste pour extraire l'identifiant pour la signature
    // On cherche l'occurrence 'upload/' ou 'raw/upload/' pour déterminer le début du chemin.
    let fileIdentifier;
    const uploadIndex = course.fileUrl.indexOf('/upload/');
    
    if (uploadIndex === -1) {
        console.error("DEBUG CLOUDINARY: Séparateur /upload/ non trouvé.");
        return res.status(500).json({ message: "URL Cloudinary invalide (séparateur d'upload manquant)." });
    }

    // On prend tout ce qui vient après le séparateur "/upload/" (y compris v<version>/...)
    fileIdentifier = course.fileUrl.substring(uploadIndex + 8); 
    
    // Pour la signature, nous devons inclure le type de ressource dans le chemin si ce n'est pas une image.
    // Cloudinary SDK le gère en interne, mais nous devons lui passer la bonne référence.

    // 🛑 LOG CRITIQUE (Activera maintenant !) 🛑
    console.log("--- DEBUG CLOUDINARY SIGNATURE ---");
    console.log("Course File URL:", course.fileUrl);
    console.log("Extracted File Identifier (Path for signing):", fileIdentifier);
    console.log("Resource Type for Signature:", 'raw');
    console.log("---------------------------------");
    // 🛑 FIN DU LOG CRITIQUE 🛑

    // On s'assure d'indiquer que la ressource est 'raw' pour la signature
    const signedUrl = cloudinary.utils.signed_download_url(fileIdentifier, {
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // Valide 1 heure
        resource_type: 'raw' 
    });

    res.json({ signedUrl });

  } catch (error) {
    console.error("Erreur génération URL signée (API SECRET CONFIRMEE CORRECTE):", error);
    res.status(500).json({ 
        message: 'Échec de la signature Cloudinary. Le fichier ou sa référence est invalide.' 
    });
  }
};


const getProfStats = async (req, res) => {
// ... (code inchangé)
};

const updateCourse = async (req, res) => {
// ... (code inchangé)
};

const deleteCourse = async (req, res) => {
// ... (code inchangé)
};

const incrementView = async (req, res) => {
// ... (code inchangé)
};

const getCourseFormData = async (req, res) => { res.json({ filieres: [], subjects: [] }); };

module.exports = { 
  createCourse, getCourses, getProfStats, updateCourse, deleteCourse, incrementView, getCourseFormData, getSignedFileUrl
};