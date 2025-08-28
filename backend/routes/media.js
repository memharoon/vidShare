// routes/media.js (CommonJS) — returns a SAS URL for a blob (video or derived poster)
const express = require('express');
const router = express.Router();
const { getBlobSasUrl } = require('../storage/blob');

// derive "<name>-thumb.jpg" from a video blob name
function deriveThumbName(blobName = '') {
  if (!blobName) return null;
  const dot = blobName.lastIndexOf('.');
  const base = dot > -1 ? blobName.slice(0, dot) : blobName;
  return `${base}-thumb.jpg`;
}

// GET /api/media/sas
// Examples:
//   /api/media/sas?blobName=myvideo.mp4&perm=cw         -> SAS to upload the video
//   /api/media/sas?blobName=myvideo.mp4                 -> read SAS for that blob
//   /api/media/sas?posterFor=myvideo.mp4                -> read SAS for "myvideo-thumb.jpg"
router.get('/sas', (req, res) => {
  try {
    const { blobName: rawBlobName, ttl: rawTtl, perm: rawPerm, posterFor } = req.query;

    // If posterFor is provided, derive a thumbnail blob name.
    let blobName = rawBlobName;
    let isPoster = false;
    if (!blobName && posterFor) {
      blobName = deriveThumbName(String(posterFor));
      isPoster = true;
    }

    if (!blobName) {
      return res.status(400).json({ error: 'blobName (or posterFor) query parameter is required' });
    }

    // TTL: default 1 hour, clamp to [60s, 86400s]
    const ttl = Math.max(60, Math.min(86400, parseInt(rawTtl || '3600', 10)));

    // permission string: default read-only ('r').
    // allow only a safe whitelist
    const requestedPerm = String(rawPerm || 'r').toLowerCase();
    const safePerm = /^(r|w|c|cw|rcw)$/.test(requestedPerm) ? requestedPerm : 'r';

    const sasUrl = getBlobSasUrl(blobName, ttl, safePerm);

    return res.json({
      blobName,
      sasUrl,
      expiresInSeconds: ttl,
      perm: safePerm,
      ...(isPoster ? { derivedFrom: String(posterFor), isPoster: true } : {})
    });
  } catch (err) {
    console.error('Failed to generate SAS URL:', err);
    return res.status(500).json({ error: 'Failed to generate SAS URL', details: err.message });
  }
});

module.exports = router;
