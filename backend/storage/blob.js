// backend/storage/blob.js (CommonJS)
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.BLOB_CONTAINER || "videos";

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Upload a Buffer to Azure Blob Storage and return the (non-SAS) blob URL.
 * @param {Buffer} buffer
 * @param {string} blobName
 * @param {string} contentType
 * @returns {Promise<string>} blobUrl
 */
async function uploadBufferToBlob(buffer, blobName, contentType = "application/octet-stream") {
  // Creates the container if it doesn't exist (safe to call repeatedly)
  await containerClient.createIfNotExists();

  const blockBlob = containerClient.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlob.url; // plain blob URL (container is private; use SAS for access)
}

/**
 * Internal: parse connection string to get account name & key
 */
function parseConnString(cs) {
  const parts = Object.fromEntries(
    cs.split(";").filter(Boolean).map(kv => {
      const [k, ...rest] = kv.split("=");
      return [k, rest.join("=")];
    })
  );
  return { accountName: parts.AccountName, accountKey: parts.AccountKey };
}

/**
 * Generate a READ-only SAS URL for a blob (default expiry: 1 hour)
 * @param {string} blobName
 * @param {number} expiresInSeconds default 3600
 * @returns {string} sasUrl
 */
function getBlobSasUrl(blobName, expiresInSeconds = 3600) {
  const { accountName, accountKey } = parseConnString(connectionString);
  const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);

  // Start a few minutes in the past to avoid clock skew issues
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + expiresInSeconds * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      startsOn,
      expiresOn,
      protocol: "https",
    },
    sharedKey
  ).toString();

  const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${encodeURIComponent(blobName)}`;
  return `${baseUrl}?${sas}`;
}

module.exports = {
  uploadBufferToBlob,
  getBlobSasUrl,
};
