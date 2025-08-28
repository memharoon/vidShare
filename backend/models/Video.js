const mongoose = require('mongoose');

// 🔹 Comment Schema
const commentSchema = new mongoose.Schema({
  user: { type: String, default: 'Anonymous' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 🔹 Rating Schema
const ratingSchema = new mongoose.Schema({
  user: { type: String, default: 'Anonymous' },
  score: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// 🔹 Video Schema (Blob-first: store blobName/container instead of local videoUrl)
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  blobName: { type: String, required: true },          // e.g., 'myvideo.mp4'
  container: { type: String, default: 'videos' },      // e.g., 'videos'
  thumbnailBlobName: { type: String },                 // <-- NEW: e.g., '...-thumb.jpg'
  publisher: String,
  producer: String,
  genre: String,
  ageRating: String,
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  comments: [commentSchema],
  ratings: [ratingSchema],
});

module.exports = mongoose.model('Video', videoSchema);
