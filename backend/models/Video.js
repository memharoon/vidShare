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
const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Storage info for the video file
    blobName: { type: String, required: true },     // e.g., 'myvideo.mp4'
    container: { type: String, default: 'videos' }, // e.g., 'videos'
    storage: { type: String, default: 'azure' },    // optional: 'azure' | 'local' | 's3'
    mimeType: { type: String },                     // e.g., 'video/mp4'
    originalName: { type: String },                 // original filename
    size: { type: Number },                         // bytes

    // Optional thumbnail info (used for poster image on load / hover preview)
    // If you don't set this, frontend can still derive `${blobName}-thumb.jpg`
    // and request a SAS for that object.
    thumbnailBlobName: { type: String },            // e.g., 'myvideo-thumb.jpg'
    thumbnailContainer: { type: String },           // if stored in a different container
    posterAt: { type: Number, default: 1 },         // seconds into the video the poster was captured (optional)
    thumbnailMimeType: { type: String },            // e.g., 'image/jpeg'

    // Metadata
    publisher: String,
    producer: String,
    genre: String,
    ageRating: String,

    // Stats
    uploadedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },

    // Engagement
    comments: [commentSchema],
    ratings: [ratingSchema],
  },
  {
    timestamps: false,
  }
);

// (Optional) quick helper to know if a custom thumbnail exists
videoSchema.virtual('hasThumbnail').get(function () {
  return !!this.thumbnailBlobName;
});

module.exports = mongoose.model('Video', videoSchema);
