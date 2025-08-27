const mongoose = require('mongoose');

// 🔹 Comment Schema
const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    default: 'Anonymous',
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔹 Rating Schema
const ratingSchema = new mongoose.Schema({
  user: {
    type: String,
    default: 'Anonymous',
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔹 Video Schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  publisher: String,
  producer: String,
  genre: String,
  ageRating: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,        // ✅ Track number of views
  },
  comments: [commentSchema],
  ratings: [ratingSchema],
});

module.exports = mongoose.model('Video', videoSchema);
