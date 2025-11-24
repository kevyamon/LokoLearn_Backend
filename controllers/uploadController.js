// kevyamon/lokolearn_backend/LokoLearn_Backend-a0fd204aec523b4df8e33ff9859b4f62884cac3e/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');
const path = require('path');

const uploadToCloudinary = (buffer, folder, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    
    const nameWithoutExt = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = path.extname(originalName);

    let publicId = nameWithoutExt + "_" + Date.now();
    
    // Configuration de base
    let options = {
        folder: folder,
        public_id: publicId,
        type: 'upload', // Toujours 'upload' (public)
    };

    const isDocument = 
        mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('office') || 
        mimeType.includes('presentation') || 
        mimeType.includes('spreadsheet') ||
        extension === '.pdf' || extension === '.docx' || extension === '.pptx';

    // Correction pour TÉLÉCHARGEMENT (Issue 401) : 
    // 1. Passage en 'raw'
    // 2. Ajout de l'extension au public_id
    // 3. Forcer le mode d'accès public via access_mode
    if (isDocument) {
        options.resource_type = 'raw';
        options.public_id = publicId + extension;
        // CORRECTION CRITIQUE 401: On force l'accès public pour les fichiers RAW
        options.access_mode = 'public'; 
    } else {
        // Pour les images/auto (bannières)
        options.resource_type = 'auto';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// 1. UPLOAD COURS
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier.' });

    const result = await uploadToCloudinary(
        req.file.buffer, 
        'lokolearn_cours', 
        req.file.originalname, 
        req.file.mimetype
    );

    res.status(200).json({
      url: result.secure_url, 
      public_id: result.public_id,
      format: result.format || path.extname(req.file.originalname).replace('.', ''),
      bytes: result.bytes,
      original_filename: req.file.originalname
    });
  } catch (error) {
    console.error("Erreur Upload:", error);
    res.status(500).json({ message: "Erreur lors du téléversement vers le cloud." });
  }
};

// 2. UPLOAD BANNIÈRE
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image.' });
    
    const result = await uploadToCloudinary(
        req.file.buffer, 
        'lokolearn_banners', 
        req.file.originalname, 
        req.file.mimetype
    );
    const newBanner = await BannerImage.create({ imageUrl: result.secure_url, publicId: result.public_id });
    res.status(201).json(newBanner);
  } catch (error) { 
    console.error("Erreur uploadBannerImage:", error);
    res.status(500).json({ message: "Erreur." }); 
  }
};

const getBannerImages = async (req, res) => {
  try { const images = await BannerImage.find().sort({ createdAt: -1 }); res.json(images); } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

const deleteBannerImage = async (req, res) => {
  try {
    const image = await BannerImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Non trouvé." });
    
    await cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' });
    await BannerImage.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé." });
  } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

module.exports = { uploadFile, uploadBannerImage, getBannerImages, deleteBannerImage };