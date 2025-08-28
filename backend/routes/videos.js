const express = require('express');
const Video = require('../models/Video');
const { getBlobSasUrl } = require('../storage/blob');

const router = express.Router();

/**
 * POST /api/videos
 * Save metadata only (file is already in Azure Blob via SAS).
 * Expects JSON: { title, publisher, producer, genre, ageRating, blobName, container? }
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      publisher,
      producer,
      genre,
      ageRating,
      blobName,
      container = 'videos',
    } = req.body;

    if (!blobName) return res.status(400).json({ error: 'blobName required' });
    if (!title) return res.status(400).json({ error: 'title required' });

    const newVideo = await Video.create({
      title,
      publisher,
      producer,
      genre,
      ageRating,
      blobName,
      container,
      comments: [],
      ratings: [],
      uploadedAt: new Date(),
    });

    return res.status(201).json({
      ...newVideo.toObject(),
      playbackUrl: getBlobSasUrl(newVideo.blobName, 3600, 'r'), // 1h read SAS
    });
  } catch (err) {
    console.error('Save metadata failed:', err);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
});

/**
 * GET /api/videos
 * Return videos with short-lived read SAS URLs for playback.
 */
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 }).lean();
    const withUrls = videos.map((v) => ({
      ...v,
      playbackUrl: getBlobSasUrl(v.blobName, 3600, 'r'),
    }));
    res.json(withUrls);
  } catch (err) {
    console.error('Fetch videos failed:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

/**
 * POST /api/videos/:id/comment
 */
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

/**
 * POST /api/videos/:id/rate
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { score, user } = req.body;
    if (!score || !user) return res.status(400).json({ message: 'Missing score or user' });
    if (score < 1 || score > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

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

/**
 * POST /api/videos/:id/view
 */
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
