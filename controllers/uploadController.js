const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const BannerImage = require('../models/bannerImageModel');

// --- FONCTION UTILITAIRE D'UPLOAD ---
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
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

    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_cours');

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      original_filename: req.file.originalname
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur upload cours." });
  }
};

// 2. UPLOAD BANNIÈRE (Admin)
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie.' });

    const result = await uploadToCloudinary(req.file.buffer, 'lokolearn_banners');

    const newBanner = await BannerImage.create({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

    // Si Socket.io est configuré, on peut notifier le frontend (optionnel ici)
    // const io = require('../socket/socketManager').getIO();
    // io.emit('banner_updated');

    res.status(201).json(newBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur upload bannière." });
  }
};

// 3. RÉCUPÉRER LES BANNIÈRES (Public)
const getBannerImages = async (req, res) => {
  try {
    const images = await BannerImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération bannières." });
  }
};

// 4. SUPPRIMER UNE BANNIÈRE (Admin)
const deleteBannerImage = async (req, res) => {
  try {
    const image = await BannerImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image non trouvée." });

    // Supprimer de Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Supprimer de la DB
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