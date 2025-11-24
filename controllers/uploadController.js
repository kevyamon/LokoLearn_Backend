// kevyamon/lokolearn_backend/LokoLearn_Backend-a0fd204aec523b4df8e33ff9859b4f62884cac3e/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');
const path = require('path');

const uploadToCloudinary = (buffer, folder, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    
    const nameWithoutExt = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = path.extname(originalName);

    let resourceType = 'auto'; 
    let publicId = nameWithoutExt + "_" + Date.now();
    let options = {
        folder: folder,
        public_id: publicId,
        type: 'upload', 
    };


    const isDocument = 
        mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('office') || 
        mimeType.includes('presentation') || 
        mimeType.includes('spreadsheet') ||
        extension === '.pdf' || extension === '.docx' || extension === '.pptx';

    if (isDocument) {
        resourceType = 'raw';
        publicId += extension; 
        
        // CORRECTION CRITIQUE : Assurer l'accès public pour les fichiers RAW
        options.resource_type = 'raw';
        options.public_id = publicId;
        // Ceci rend le fichier accessible publiquement via l'URL simple
        options.access_control = 'public'; 
    } else {
        // Pour les images/auto, on peut utiliser resource_type 'auto'
        options.resource_type = 'auto';
        options.public_id = publicId;
        options.access_control = 'public'; 
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
    console.error(error);
    res.status(500).json({ message: "Erreur upload." });
  }
};

// Les autres fonctions ne changent pas...
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image.' });
    // Pour les images de bannière, on veut qu'elles soient publiques
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
    // On détruit l'image selon son type (toujours 'image' pour la bannière)
    await cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' });
    await BannerImage.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé." });
  } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

module.exports = { uploadFile, uploadBannerImage, getBannerImages, deleteBannerImage };