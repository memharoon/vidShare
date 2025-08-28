import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from '../api'; // <-- use shared API base + auth

function UploadPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    producer: '',
    genre: '',
    ageRating: '',
  });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        setMessage('❌ Please select a valid video file.');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ---- NEW: generate thumbnail (first frame) client-side
  async function generateThumbnailBlob(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = url;

      const cleanup = () => URL.revokeObjectURL(url);

      video.addEventListener('loadedmetadata', () => {
        // seek a tiny bit in to avoid black first frame
        const targetTime = Math.min(1, (video.duration || 2) / 4);
        const onSeeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                cleanup();
                if (blob) resolve(blob);
                else reject(new Error('Failed to create thumbnail blob'));
              },
              'image/jpeg',
              0.8
            );
          } catch (e) {
            cleanup();
            reject(e);
          } finally {
            video.removeEventListener('seeked', onSeeked);
          }
        };
        video.addEventListener('seeked', onSeeked);
        try { video.currentTime = targetTime; } catch { /* noop */ }
      });

      video.addEventListener('error', (e) => {
        cleanup();
        reject(new Error('Video load error'));
      });
    });
  }

  // ---- UPDATED: direct-to-Blob upload via SAS, then save metadata (incl. thumbnail)
  const handleUpload = async () => {
    if (!videoFile || !formData.title.trim()) {
      setMessage('❗ Please provide a title and select a video.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('⚠️ You must be logged in to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage('');

      const uid = (crypto?.randomUUID?.() || Date.now());
      const safeName = videoFile.name.replace(/\s+/g, '-');
      const blobName = `${uid}-${safeName}`;
      const thumbName = `${uid}-thumb.jpg`;               // <-- NEW

      // 1) ask backend for SAS to upload video
      const { data: sasResp } = await api.get('/api/media/sas', {
        params: { blobName, ttl: 3600, perm: 'cw' },
      });
      const sasUrl = sasResp.sasUrl;

      // 2) PUT the video to Blob
      await axios.put(sasUrl, videoFile, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'x-ms-blob-content-type': videoFile.type || 'application/octet-stream',
        },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.min(99, (evt.loaded / evt.total) * 100);
            setUploadProgress(pct);
          }
        },
      });

      // 3) Create and upload thumbnail to Blob (same container)
      let thumbnailBlobName = null;
      try {
        const thumbBlob = await generateThumbnailBlob(videoFile);
        const { data: thumbSas } = await api.get('/api/media/sas', {
          params: { blobName: thumbName, ttl: 3600, perm: 'cw' },
        });
        await axios.put(thumbSas.sasUrl, thumbBlob, {
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'x-ms-blob-content-type': 'image/jpeg',
          },
        });
        thumbnailBlobName = thumbName;
      } catch (e) {
        // thumbnail is optional; continue without failing the upload
        console.warn('Thumbnail generation/upload failed', e);
      }

      setUploadProgress(100);

      // 4) Save metadata in Mongo via backend
      setAuthToken(token);
      await api.post('/api/videos', {
        title: formData.title,
        genre: formData.genre,
        ageRating: formData.ageRating,
        publisher: formData.publisher,
        producer: formData.producer,
        blobName,
        thumbnailBlobName,                 // <-- NEW
        storage: 'azure',
        originalName: videoFile.name,
        mimeType: videoFile.type,
        size: videoFile.size,
      });

      setMessage('✅ Video uploaded successfully!');
      setTimeout(() => {
        setFormData({ title: '', publisher: '', producer: '', genre: '', ageRating: '' });
        setVideoFile(null);
        setUploadProgress(0);
        navigate('/creator-dashboard');
      }, 1200);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage(`❌ ${error?.response?.data?.error || error.message || 'Failed to upload video.'}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ----------------- styles & layout unchanged below -----------------
  // (rest of your component stays the same)
  // ...
}

export default UploadPage;
