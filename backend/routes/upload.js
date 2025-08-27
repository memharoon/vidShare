// routes/upload.js (CommonJS + Azure Blob)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuid } = require('uuid');
const { uploadBufferToBlob } = require('../storage/blob'); // uses AZURE_STORAGE_CONNECTION_STRING

// Multer: keep file in memory, validate type & size
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit (adjust if needed)
  fileFilter: (req, file, cb) => {
    const allowed = [
      'video/mp4',
      'video/x-matroska', // .mkv
      'video/quicktime',  // .mov
      'video/x-msvideo'   // .avi
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type. Allowed: mp4, mkv, mov, avi'));
    }
    cb(null, true);
  },
});

// POST /api/upload   (assuming app.js mounts as app.use('/api/upload', router))
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and video file are required.' });
    }

    const original = req.file.originalname || 'video.mp4';
    const ext = original.includes('.') ? original.split('.').pop() : 'mp4';
    const blobName = `${uuid()}.${ext}`;

    // Upload buffer to Azure Blob
    const url = await uploadBufferToBlob(req.file.buffer, blobName, req.file.mimetype);

    // (DB save comes later) — return info for now
    return res.status(201).json({
      message: 'Upload successful!',
      title,
      blobName,
      url, // plain blob URL (SAS-secure playback endpoint will come next)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
