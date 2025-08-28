
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

  // ---- UPDATED: direct-to-Blob upload via SAS, then save metadata ----
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

      // Unique blob name (kept under the fixed 'videos' container on the backend)
      const uid = (crypto?.randomUUID?.() || Date.now());
      const safeName = videoFile.name.replace(/\s+/g, '-');
      const blobName = `${uid}-${safeName}`;

      // 1) Ask backend for a SAS with create+write perms
      //    GET /api/media/sas?blobName=<...>&ttl=3600&perm=cw
      const { data: sasResp } = await api.get('/api/media/sas', {
        params: { blobName, ttl: 3600, perm: 'cw' },
      });
      const sasUrl = sasResp.sasUrl;

      // 2) PUT the file to Azure Blob Storage (track progress)
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

      setUploadProgress(100);

      // 3) Save metadata in Mongo via backend
      setAuthToken(token); // sets Authorization header on our shared axios instance
      await api.post('/api/videos', {
        title: formData.title,
        genre: formData.genre,
        ageRating: formData.ageRating,
        publisher: formData.publisher,
        producer: formData.producer,

        // Store blobName; Dashboard will request a read SAS to play it
        blobName,

        // Back-compat if your backend used `videoUrl` earlier
        videoUrl: blobName,

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
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    mouseGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`
    },
    navbar: {
      position: 'relative',
      zIndex: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '24px' },
    navBrand: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
    navBrandIcon: {
      padding: '8px',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    navBrandText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    navLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    logoutBtn: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    content: {
      position: 'relative',
      zIndex: 10,
      padding: '40px 32px',
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out',
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd, #fbbf24)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: { color: '#d1d5db', fontSize: '1.1rem', marginBottom: '32px' },
    uploadContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.3s',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '40px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    uploadArea: {
      border: dragActive ? '2px dashed #a855f7' : '2px dashed rgba(255, 255, 255, 0.3)',
      borderRadius: '16px',
      padding: '40px 20px',
      textAlign: 'center',
      marginBottom: '32px',
      background: dragActive ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    uploadIcon: { fontSize: '3rem', marginBottom: '16px', color: dragActive ? '#a855f7' : '#9ca3af' },
    uploadText: { color: '#d1d5db', fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' },
    uploadSubtext: { color: '#9ca3af', fontSize: '0.9rem', marginBottom: '16px' },
    fileInput: { display: 'none' },
    browseButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      color: '#22c55e'
    },
    fileDetails: { display: 'flex', alignItems: 'center', gap: '12px' },
    fileName: { fontWeight: '600', fontSize: '1rem' },
    fileSize: { fontSize: '0.9rem', opacity: 0.8 },
    removeButton: {
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    inputGroup: { position: 'relative' },
    inputLabel: {
      color: '#d1d5db',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
      display: 'block'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    },
    requiredField: { color: '#ef4444', fontSize: '12px', marginTop: '4px' },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      background: message.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: message.includes('✅') ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
      color: message.includes('✅') ? '#22c55e' : '#ef4444',
      marginBottom: '20px'
    },
    uploadButtonContainer: { textAlign: 'center' },
    uploadButton: {
      padding: '16px 32px',
      background: uploading ? 'rgba(147, 51, 234, 0.6)' : 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: uploading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '200px',
      justifyContent: 'center'
    },
    progressContainer: { marginTop: '20px', display: uploading ? 'block' : 'none' },
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      width: `${uploadProgress}%`,
      transition: 'width 0.3s ease',
      borderRadius: '4px'
    },
    progressText: { color: '#d1d5db', fontSize: '14px', textAlign: 'center' },
    loadingSpinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .input:focus {
            border-color: rgba(147, 51, 234, 0.6) !important;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
          }
          .input::placeholder { color: rgba(255, 255, 255, 0.6); }
          .upload-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669, #047857) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4) !important;
          }
          .browse-button:hover { background: linear-gradient(135deg, #7c3aed, #db2777) !important; transform: translateY(-2px) !important; }
          .remove-button:hover { background: rgba(239, 68, 68, 0.3) !important; }
          .nav-link:hover { background: rgba(255, 255, 255, 0.1) !important; color: #ffffff !important; }
          .logout-btn:hover { background: linear-gradient(135deg, #ef4444, #dc2626) !important; transform: scale(1.05) !important; }
          @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 16px; padding: 16px; }
            .nav-left, .nav-right { flex-wrap: wrap; justify-content: center; }
            .content { padding: 20px 16px; }
            .upload-container { padding: 24px; }
            .form-grid { grid-template-columns: 1fr; }
          }
        `}
      </style>

      <div style={styles.mouseGradient} />

      {/* Navigation Header */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <Link to="/" style={styles.navBrand}>
            <div style={styles.navBrandIcon}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span style={styles.navBrandText}>VidShare</span>
          </Link>
        </div>

        <div style={styles.navRight}>
          <Link to="/dashboard" style={styles.navLink} className="nav-link"><span>📺</span><span>Dashboard</span></Link>
          <Link to="/creator-dashboard" style={styles.navLink} className="nav-link"><span>📁</span><span>My Videos</span></Link>
          <Link to="/stats" style={styles.navLink} className="nav-link"><span>📈</span><span>Stats</span></Link>
          <button
            onClick={() => window.confirm('Are you sure you want to logout?') && handleLogout()}
            style={styles.logoutBtn}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}><span>🎬</span><span>Upload New Video</span></h1>
          <p style={styles.subtitle}>Share your content with the world</p>
        </div>

        <div style={styles.uploadContainer} className="upload-container">
          {message && <div style={styles.message}>{message}</div>}

          {/* File Upload Area */}
          <div
            style={styles.uploadArea}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('video-upload').click()}
          >
            <div style={styles.uploadIcon}>{dragActive ? '📁' : '🎥'}</div>
            <div style={styles.uploadText}>{dragActive ? 'Drop your video here' : 'Upload Video File'}</div>
            <div style={styles.uploadSubtext}>Drag and drop or click to browse (MP4, AVI, MOV)</div>
            <input id="video-upload" type="file" accept="video/*" onChange={handleFileSelect} style={styles.fileInput} />
            <button style={styles.browseButton} className="browse-button">Choose File</button>
          </div>

          {/* Selected File Info */}
          {videoFile && (
            <div style={styles.fileInfo}>
              <div style={styles.fileDetails}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <div>
                  <div style={styles.fileName}>{videoFile.name}</div>
                  <div style={styles.fileSize}>{formatFileSize(videoFile.size)}</div>
                </div>
              </div>
              <button
                style={styles.removeButton}
                className="remove-button"
                onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Form Fields */}
          <div style={styles.formGrid} className="form-grid">
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter video title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                className="input"
              />
              <div style={styles.requiredField}>Required field</div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Genre</label>
              <input
                type="text"
                name="genre"
                placeholder="e.g., Comedy, Drama, Action"
                value={formData.genre}
                onChange={handleChange}
                style={styles.input}
                className="input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Publisher</label>
              <input
                type="text"
                name="publisher"
                placeholder="Publisher name"
                value={formData.publisher}
                onChange={handleChange}
                style={styles.input}
                className="input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Producer</label>
              <input
                type="text"
                name="producer"
                placeholder="Producer name"
                value={formData.producer}
                onChange={handleChange}
                style={styles.input}
                className="input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Age Rating</label>
              <input
                type="text"
                name="ageRating"
                placeholder="e.g., PG, PG-13, R"
                value={formData.ageRating}
                onChange={handleChange}
                style={styles.input}
                className="input"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div style={styles.uploadButtonContainer}>
            <button
              style={styles.uploadButton}
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Upload Video</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            <div style={styles.progressText}>
              {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Complete!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
