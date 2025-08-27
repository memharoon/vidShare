// frontend/src/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE,
});

// Get a time-limited SAS URL for a blob
export async function getSasUrl(blobName, ttl = 3600) {
  const { data } = await api.get("/api/media/sas", {
    params: { blobName, ttl },
  });
  return data; // { blobName, sasUrl, expiresInSeconds }
}
