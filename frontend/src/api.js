// frontend/src/api.js
import axios from "axios";

const DEFAULT_API =
  "https://vidshare-backend-gxeth5h7a2bng4eh.canadacentral-01.azurewebsites.net";

// Prefer build-time env var; fall back to your Azure backend (not localhost)
const API_BASE = (
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  DEFAULT_API
).replace(/\/+$/, ""); // strip trailing slash

export const api = axios.create({
  baseURL: API_BASE,
});

// Optional: call this after login/logout to set/remove the auth header
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Get a time-limited SAS URL for a blob
export async function getSasUrl(blobName, ttl = 3600) {
  const { data } = await api.get("/api/media/sas", {
    params: { blobName, ttl },
  });
  return data; // { blobName, sasUrl, expiresInSeconds }
}
