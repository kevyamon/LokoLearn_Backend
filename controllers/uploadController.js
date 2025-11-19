// controllers/uploadController.js
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc    Uploader un fichier vers Cloudinary
// @route   POST /api/upload
// @access  Private (Prof)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }

    // Configuration de l'upload (Dossier: cours)
    // resource_type: 'auto' permet d'accepter images, pdfs, vidéos, raw files...
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lokolearn_cours',
        resource_type: 'auto', 
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          return res.status(500).json({ message: "Erreur lors de l'upload Cloudinary." });
        }

        // Succès ! On renvoie les infos utiles
        res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes, // Taille en octets
          original_filename: req.file.originalname
        });
      }
    );

    // On transforme le buffer (mémoire) en stream pour Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur upload.' });
  }
};

module.exports = { uploadFile };