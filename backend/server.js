// server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load .env locally; on Azure, App Settings provide env vars
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const app = express();

// --- Middleware
app.use(cors());                         // open CORS (simple + safe start)
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Health + root (helpful for Azure warmup checks)
app.get('/health', (_req, res) => res.status(200).send('ok'));
app.get('/', (_req, res) => res.status(200).send('VidShare API running'));

// --- Routes (your existing ones)
const videoRoutes = require('./routes/videos');
const uploadRoute = require('./routes/upload');
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');

app.use('/api/videos', videoRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);

console.log('📦 Routes loaded: /api/videos /api/upload /api/auth /api/media');

// --- Start HTTP server first so Azure sees a listener
const PORT = process.env.PORT || 8080;   // Azure sets PORT (often 8080)
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ API listening on http://${HOST}:${PORT}`);
});

// --- Connect to MongoDB (non-blocking so server still boots)
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set');
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// Optional: basic 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
