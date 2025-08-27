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
const keyMatch  = /AccountKey=([^;]+)/i.exec(CONN);
if (!nameMatch || !keyMatch) throw new Error('Invalid AZURE_STORAGE_CONNECTION_STRING');

const ACCOUNT = nameMatch[1];
const KEY     = keyMatch[1];
const CREDS   = new StorageSharedKeyCredential(ACCOUNT, KEY);

// Use the container your app expects
const CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'videos';

function getBlobSasUrl(blobName, ttlSeconds = 3600, perm = 'r') {
  // perm can be 'r', 'w', 'c', 'cw', 'rcw', etc.
  const permissions = BlobSASPermissions.parse(String(perm).toLowerCase());
  const startsOn = new Date(Date.now() - 5 * 60 * 1000); // clock skew
  const expiresOn = new Date(Date.now() + ttlSeconds * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: CONTAINER,
      blobName,
      permissions,
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
    },
    CREDS
  ).toString();

  return `https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}/${encodeURIComponent(blobName)}?${sas}`;
}

module.exports = { getBlobSasUrl };
