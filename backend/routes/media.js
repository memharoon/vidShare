// routes/media.js (CommonJS) — returns a SAS URL for a blob
const express = require('express');
const router = express.Router();
const { getBlobSasUrl } = require('../storage/blob');

// GET /api/media/sas?blobName=<name>&ttl=<seconds optional>&perm=<r|cw|rcw>
router.get('/sas', (req, res) => {
  try {
    const blobName = req.query.blobName;
    if (!blobName) {
      return res.status(400).json({ error: 'blobName query parameter is required' });
    }

    const ttl = parseInt(req.query.ttl || '3600', 10); // default 1 hour

    // permission string: default read-only ('r').
    // for uploads request 'cw' (create+write). We whitelist a few safe combos.
    const requestedPerm = String(req.query.perm || 'r').toLowerCase();
    const safePerm = /^(r|w|c|cw|rcw)$/.test(requestedPerm) ? requestedPerm : 'r';

    // Pass perm as 3rd arg (backwards compatible if implementation ignores extras)
    const sasUrl = getBlobSasUrl(blobName, ttl, safePerm);

    return res.json({ blobName, sasUrl, expiresInSeconds: ttl, perm: safePerm });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate SAS URL', details: err.message });
  }
});

module.exports = router;
