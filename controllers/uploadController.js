const cloudinary = require('cloudinary').v2;
const BannerImage = require('../models/bannerImageModel');

// @desc    Téléverser une image pour la bannière
// @route   POST /api/upload/banner
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier sélectionné' });
    }

    // On utilise un stream pour envoyer le buffer directement à Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "lokolearn_banner" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Erreur serveur lors du téléversement' });
        }

        const newImage = new BannerImage({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
        await newImage.save();

        res.status(201).json({
          message: 'Image téléversée avec succès',
          imageUrl: result.secure_url,
        });
      }
    );

    // On envoie le buffer du fichier dans le stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors du téléversement' });
  }
};

// @desc    Récupérer toutes les images de la bannière
// @route   GET /api/upload/banner
const getBannerImages = async (req, res) => {
    try {
        const images = await BannerImage.find({});
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// @desc    Supprimer une image de la bannière
// @route   DELETE /api/upload/banner/:id
const deleteBannerImage = async (req, res) => {
  try {
    const image = await BannerImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image non trouvée' });
    }

    // 1. Supprimer l'image de Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // 2. Supprimer la référence de notre base de données
    await BannerImage.deleteOne({ _id: req.params.id });

    res.json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};

module.exports = { uploadBannerImage, getBannerImages, deleteBannerImage };