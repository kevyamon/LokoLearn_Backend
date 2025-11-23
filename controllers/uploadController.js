// kevyamon/lokolearn_backend/LokoLearn_Backend-80d946f165c0cfa3aca77a220fc2a35a52f497cd/controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');
const path = require('path'); // Nécessaire pour récupérer l'extension

// --- FONCTION UTILITAIRE D'UPLOAD ---
const uploadToCloudinary = (buffer, folder, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    
    // 1. Nettoyage du nom (On garde la base propre)
    const nameWithoutExt = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = path.extname(originalName); // ex: .pdf

    // 2. STRATÉGIE ANTI-401 : Forcer le mode RAW pour les documents
    // Cela contourne les sécurités d'image de Cloudinary
    let resourceType = 'auto';
    let publicId = nameWithoutExt + "_" + Date.now();

    const isDocument = 
        mimeType.includes('pdf') ||
        mimeType.includes('msword') ||
        mimeType.includes('office') || // docx, pptx, xlsx
        mimeType.includes('presentation');

    if (isDocument) {
        resourceType = 'raw';
        // IMPORTANT : En mode RAW, il faut ajouter l'extension manuellement au nom
        publicId += extension; 
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType, 
        public_id: publicId,
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

    // On passe le mimetype pour décider si c'est RAW ou AUTO
    const result = await uploadToCloudinary(
        req.file.buffer, 
        'lokolearn_cours', 
        req.file.originalname, 
        req.file.mimetype
    );

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      // Si c'est raw, Cloudinary ne renvoie pas toujours le format, on l'extrait du fichier original
      format: result.format || path.extname(req.file.originalname).replace('.', ''),
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

    // Les bannières sont toujours des images, donc on laisse 'auto' (qui détectera image)
    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_banners', req.file.originalname, req.file.mimetype);

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

    // Attention : pour supprimer, il faut préciser le resource_type si c'était pas 'image'
    // Mais ici les bannières sont toujours des images.
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