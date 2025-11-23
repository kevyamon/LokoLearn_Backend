// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');

// --- FONCTION UTILITAIRE D'UPLOAD ---
const uploadToCloudinary = (buffer, folder, originalName) => {
  return new Promise((resolve, reject) => {
    
    // Nettoyage du nom de fichier (pour éviter les 404/401 à cause des accents/espaces)
    const cleanName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Laisse Cloudinary décider (Raw pour docx, Image pour pdf)
        public_id: cleanName + "_" + Date.now(), // Nom unique et propre
        access_mode: 'public', // FORCE L'ACCÈS PUBLIC
        type: 'upload' // Type standard
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// 1. UPLOAD COURS (Prof)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_cours', req.file.originalname);

    res.status(200).json({
      url: result.secure_url, // L'URL HTTPS sécurisée
      public_id: result.public_id,
      format: result.format || result.resource_type, // 'pdf', 'docx' ou 'raw'
      bytes: result.bytes,
      original_filename: req.file.originalname
    });
  } catch (error) {
    console.error("Erreur Upload Cloudinary:", error);
    res.status(500).json({ message: "Erreur upload vers le serveur de fichiers." });
  }
};

// 2. UPLOAD BANNIÈRE (Admin)
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_banners', req.file.originalname);

    const newBanner = await BannerImage.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.status(201).json(newBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur upload bannière." });
  }
};

// 3. RÉCUPÉRER LES BANNIÈRES
const getBannerImages = async (req, res) => {
  try {
    const images = await BannerImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération bannières." });
  }
};

// 4. SUPPRIMER UNE BANNIÈRE
const deleteBannerImage = async (req, res) => {
  try {
    const image = await BannerImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image non trouvée." });

    await cloudinary.uploader.destroy(image.publicId);
    await BannerImage.findByIdAndDelete(req.params.id);

    res.json({ message: "Image supprimée." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur suppression." });
  }
};

module.exports = { 
  uploadFile, 
  uploadBannerImage, 
  getBannerImages, 
  deleteBannerImage 
};