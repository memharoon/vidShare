const express = require('express');
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');

const router = express.Router();

// 📁 Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extName) return cb(null, true);
  cb(new Error('Only video files are allowed!'));
};

const upload = multer({ storage, fileFilter });

// ✅ Upload a new video
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { title, publisher, producer, genre, ageRating } = req.body;

    const newVideo = new Video({
      title,
      videoUrl: `/uploads/${req.file.filename}`,
      publisher,
      producer,
      genre,
      ageRating,
      comments: [],   // ✅ Ensure comments array is initialized
      ratings: []     // ✅ Ensure ratings array is initialized
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a comment to a video
router.post('/:id/comment', async (req, res) => {
  try {
    const { user, text } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (!text || !user) return res.status(400).json({ message: 'Missing comment or user' });

    video.comments.push({ user, text });
    await video.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Submit a rating to a video
router.post('/:id/rate', async (req, res) => {
  try {
    const { score, user } = req.body;
    if (!score || !user) {
      return res.status(400).json({ message: 'Missing score or user' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.ratings.push({ user, score });
    await video.save();

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Error saving rating:', err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Increment video view count
router.post('/:id/view', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    video.views += 1;
    await video.save();

    res.status(200).json({ message: 'View count updated' });
  } catch (err) {
    console.error('Error updating view count:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
