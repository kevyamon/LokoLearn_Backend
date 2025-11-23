// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');
const path = require('path');

const uploadToCloudinary = (buffer, folder, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    
    const nameWithoutExt = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = path.extname(originalName);

    // PAR DÉFAUT : AUTO (Pour images, vidéos)
    let resourceType = 'auto'; 
    let publicId = nameWithoutExt + "_" + Date.now();

    // SI C'EST UN DOCUMENT : ON FORCE LE MODE "RAW" (FICHIER BRUT)
    // C'est le mode "Disque Dur en ligne", sans traitement d'image
    const isDocument = 
        mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('office') || 
        mimeType.includes('presentation') || 
        mimeType.includes('spreadsheet') ||
        extension === '.pdf' || extension === '.docx' || extension === '.pptx';

    if (isDocument) {
        resourceType = 'raw';
        // En mode RAW, Cloudinary a besoin de l'extension dans le nom
        publicId += extension; 
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: publicId,
        // TRES IMPORTANT : On force l'accès public
        type: 'upload', 
        access_mode: 'public'
      },
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
      url: result.secure_url, // URL HTTPS
      public_id: result.public_id,
      // Si RAW, le format n'est pas toujours renvoyé, on le déduit
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
    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_banners', req.file.originalname, req.file.mimetype);
    const newBanner = await BannerImage.create({ imageUrl: result.secure_url, publicId: result.public_id });
    res.status(201).json(newBanner);
  } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

const getBannerImages = async (req, res) => {
  try { const images = await BannerImage.find().sort({ createdAt: -1 }); res.json(images); } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

const deleteBannerImage = async (req, res) => {
  try {
    const image = await BannerImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Non trouvé." });
    await cloudinary.uploader.destroy(image.publicId);
    await BannerImage.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé." });
  } catch (error) { res.status(500).json({ message: "Erreur." }); }
};

module.exports = { uploadFile, uploadBannerImage, getBannerImages, deleteBannerImage };