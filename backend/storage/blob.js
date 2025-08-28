// storage/blob.js
const {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} = require('@azure/storage-blob');

const CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!CONN) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');

const nameMatch = /AccountName=([^;]+)/i.exec(CONN);
const keyMatch = /AccountKey=([^;]+)/i.exec(CONN);
if (!nameMatch || !keyMatch) throw new Error('Invalid AZURE_STORAGE_CONNECTION_STRING');

const ACCOUNT = nameMatch[1];
const KEY = keyMatch[1];
const CREDS = new StorageSharedKeyCredential(ACCOUNT, KEY);

// Default container (videos). Posters are saved in the same container using "<name>-thumb.jpg".
const DEFAULT_CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'videos';

// Encode blob names but keep slashes, since Azure supports "/" inside blob names
const encodeBlobPath = (name) => encodeURIComponent(name).replace(/%2F/g, '/');

/**
 * Build a SAS URL for a blob.
 * @param {string} blobName           - Blob name (e.g., "movie.mp4" or "posters/foo-thumb.jpg")
 * @param {number} ttlSeconds         - Expiration in seconds (default 3600)
 * @param {string} perm               - Permissions: 'r', 'w', 'c', 'cw', 'rcw' (default 'r')
 * @param {string} [container]        - Optional container override (defaults to DEFAULT_CONTAINER)
 * @returns {string}                  - Fully-qualified SAS URL
 */
function getBlobSasUrl(blobName, ttlSeconds = 3600, perm = 'r', container = DEFAULT_CONTAINER) {
  if (!blobName) throw new Error('blobName is required');

  const permissions = BlobSASPermissions.parse(String(perm).toLowerCase());
  const startsOn = new Date(Date.now() - 5 * 60 * 1000); // allow for clock skew
  const expiresOn = new Date(Date.now() + ttlSeconds * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions,
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
    },
    CREDS
  ).toString();

  return `https://${ACCOUNT}.blob.core.windows.net/${encodeURIComponent(container)}/${encodeBlobPath(blobName)}?${sas}`;
}

/**
 * Plain public URL (no SAS). Useful for debugging/CDN scenarios.
 * @param {string} blobName
 * @param {string} [container]
 * @returns {string}
 */
function getBlobUrl(blobName, container = DEFAULT_CONTAINER) {
  if (!blobName) throw new Error('blobName is required');
  return `https://${ACCOUNT}.blob.core.windows.net/${encodeURIComponent(container)}/${encodeBlobPath(blobName)}`;
}

module.exports = { getBlobSasUrl, getBlobUrl };
