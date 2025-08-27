// routes/media.js (CommonJS) — returns a read-only SAS URL for a blob
const express = require('express');
const router = express.Router();
const { getBlobSasUrl } = require('../storage/blob');

// GET /api/media/sas?blobName=<name>&ttl=<seconds optional>
router.get('/sas', (req, res) => {
  try {
    const blobName = req.query.blobName;
    if (!blobName) {
      return res.status(400).json({ error: 'blobName query parameter is required' });
    }

    const ttl = parseInt(req.query.ttl || '3600', 10); // default 1 hour
    const sasUrl = getBlobSasUrl(blobName, ttl);
    return res.json({ blobName, sasUrl, expiresInSeconds: ttl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate SAS URL', details: err.message });
  }
});

module.exports = router;
