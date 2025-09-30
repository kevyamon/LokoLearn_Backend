const cloudinary = require('cloudinary').v2;
const BannerImage = require('../models/bannerImageModel');

// @desc    Téléverser une image pour la bannière
// @route   POST /api/upload/banner
// @access  Admin (à protéger plus tard)
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier sélectionné' });
    }

    // On transforme le buffer du fichier en data URI pour Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // On envoie à Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "lokolearn_banner",
    });

    // On sauvegarde l'URL dans notre base de données
    const newImage = new BannerImage({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
    await newImage.save();

    res.status(201).json({
      message: 'Image téléversée avec succès',
      imageUrl: result.secure_url,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors du téléversement' });
  }
};

// @desc    Récupérer toutes les images de la bannière
// @route   GET /api/upload/banner
// @access  Public
const getBannerImages = async (req, res) => {
    try {
        const images = await BannerImage.find({});
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = { uploadBannerImage, getBannerImages };