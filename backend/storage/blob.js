// storage/blob.js
const {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} = require('@azure/storage-blob');

const CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!CONN) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');

const ACCOUNT  = /AccountName=([^;]+)/i.exec(CONN)[1];
const KEY      = /AccountKey=([^;]+)/i.exec(CONN)[1];
const CREDS    = new StorageSharedKeyCredential(ACCOUNT, KEY);

// Use your container; change if needed
const CONTAINER = process.env.AZURE_BLOB_CONTAINER || 'videos';

function getBlobSasUrl(blobName, ttlSeconds = 3600, perm = 'r') {
  const permissions = BlobSASPermissions.parse(perm); // e.g. 'r', 'cw', 'rcw'
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
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
