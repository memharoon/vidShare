// frontend/src/api.js
import axios from "axios";

// Prefer build-time env var set in frontend/.env
// REACT_APP_API_BASE=https://vidshare-backend-gxeth5h7a2bng4eh.canadacentral-01.azurewebsites.net
const API_BASE = (
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, ""); // strip trailing slash if present

export const api = axios.create({
  baseURL: API_BASE,
  // withCredentials: true, // enable later if you switch to cookie-based auth
});

// Get a time-limited SAS URL for a blob
export async function getSasUrl(blobName, ttl = 3600) {
  const { data } = await api.get("/api/media/sas", {
    params: { blobName, ttl },
  });
  return data; // { blobName, sasUrl, expiresInSeconds }
}
