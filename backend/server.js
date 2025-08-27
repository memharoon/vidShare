const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const videoRoutes = require('./routes/videos');
const uploadRoute = require('./routes/upload');
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media'); // ✅ NEW

app.use('/api/videos', videoRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes); // ✅ NEW

console.log("📦 Routes loaded: /api/videos");
console.log("📦 Routes loaded: /api/upload");
console.log("📦 Routes loaded: /api/auth");
console.log("📦 Routes loaded: /api/media"); // ✅ NEW

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
