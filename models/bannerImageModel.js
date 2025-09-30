const mongoose = require('mongoose');

const bannerImageSchema = mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const BannerImage = mongoose.model('BannerImage', bannerImageSchema);

module.exports = BannerImage;