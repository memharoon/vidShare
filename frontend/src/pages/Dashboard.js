// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken, getSasUrl } from '../api';

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [searchAgeRating, setSearchAgeRating] = useState('');
  const [newComments, setNewComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  // smooth entrance + background mouse parallax
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

  // helper to make a playable URL + thumbnail URL for each video
  const API_BASE = api.defaults.baseURL.replace(/\/+$/, '');

  const PLACEHOLDER_POSTER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1f2937" offset="0"/><stop stop-color="#4c1d95" offset="1"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><g fill="#c4b5fd" opacity="0.85"><path d="M260 120l140 60-140 60z"/></g></svg>`
    );

  const filenameNoExt = (name = '') => {
    const i = name.lastIndexOf('.');
    return i > -1 ? name.slice(0, i) : name;
  };

  async function toPlayable(video) {
    const raw = video.videoUrl || video.url || video.blobName;
    let playUrl = null;

    if (raw) {
      // already absolute (e.g., Azure Blob SAS or CDN)
      if (/^https?:\/\//i.test(raw)) {
        playUrl = raw;
      } else if (raw.startsWith('/')) {
        // served by our backend (e.g., "/uploads/...")
        playUrl = `${API_BASE}${raw}`;
      } else {
        // otherwise treat as blobName and fetch a read-only SAS
        try {
          const { sasUrl } = await getSasUrl(raw, 3600);
          playUrl = sasUrl;
        } catch {
          playUrl = null;
        }
      }
    }

    // Resolve thumbnail URL (prefer server-provided, else derive)
    let thumbUrl = video.thumbnailUrl || null;
    if (!thumbUrl) {
      const thumbBlobName =
        video.thumbBlobName ||
        (video.blobName ? `${filenameNoExt(video.blobName)}-thumb.jpg` : null);

      if (thumbBlobName) {
        try {
          const { sasUrl: thumbSas } = await getSasUrl(thumbBlobName, 3600);
          thumbUrl = thumbSas;
        } catch {
          thumbUrl = null;
        }
      }
    }

    return { ...video, playUrl, thumbUrl };
  }

  // load videos from backend (uses API base, not localhost)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token || null);

    (async () => {
      try {
        const res = await api.get('/api/videos');
        const list = Array.isArray(res.data) ? res.data : [];
        const resolved = await Promise.all(list.map(toPlayable));
        setVideos(resolved.reverse());
        setError('');
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('❌ Failed to load videos.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthToken(null);
    navigate('/login');
  };

  const handleComment = async (videoId) => {
    const text = newComments[videoId]?.trim();
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1]))?.email : '';

    if (!text || !user) {
      alert('Please enter a comment and ensure you are logged in.');
      return;
    }

    try {
      await api.post(`/api/videos/${videoId}/comment`, { user, text });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, comments: [...(v.comments || []), { user, text }] }
            : v
        )
      );
      setNewComments((prev) => ({ ...prev, [videoId]: '' }));
    } catch (err) {
      console.error(err);
      alert('Error submitting comment.');
    }
  };

  const handleRating = async (videoId) => {
    const score = ratings[videoId];
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(atob(token.split('.')[1]))?.email : '';

    if (!score || !user) {
      alert('Please select a rating and ensure you are logged in.');
      return;
    }

    try {
      await api.post(`/api/videos/${videoId}/rate`, { user, score });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, ratings: [...(v.ratings || []), { user, score }] }
            : v
        )
      );
      setRatings((prev) => ({ ...prev, [videoId]: 0 }));
    } catch (err) {
      console.error(err);
      alert('Error submitting rating.');
    }
  };

  const calculateAverageRating = (video) => {
    if (!video?.ratings?.length) return 'N/A';
    const total = video.ratings.reduce((sum, r) => sum + r.score, 0);
    return (total / video.ratings.length).toFixed(1);
  };

  const filteredVideos = videos.filter((video) =>
    (video.title || '').toLowerCase().includes(searchTitle.toLowerCase()) &&
    (video.genre || '').toLowerCase().includes(searchGenre.toLowerCase()) &&
    (String(video.ageRating || '')).includes(searchAgeRating)
  );

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
      fontWeight: '500'
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
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    hero: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out',
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd, #fbbf24)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: '0 0 16px 0'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#d1d5db',
      marginBottom: '32px',
      maxWidth: '600px',
      margin: '0 auto 32px auto',
      lineHeight: 1.6
    },
    searchSection: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.2s',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '48px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    searchTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    searchGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px'
    },
    searchField: { display: 'flex', flexDirection: 'column', gap: '8px' },
    searchLabel: { color: '#d1d5db', fontWeight: '500', fontSize: '0.9rem' },
    searchInput: {
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    errorBanner: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      borderRadius: '16px',
      padding: '16px 24px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)'
    },
    videosSection: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.4s'
    },
    videosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
      gap: '32px'
    },
    videoCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    videoContainer: {
      position: 'relative',
      width: '100%',
      paddingTop: '56.25%',
      background: '#000',
      borderRadius: '20px 20px 0 0'
    },
    videoPlayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '20px 20px 0 0'
    },
    videoDetails: { padding: '24px' },
    videoTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: 'white',
      margin: '0 0 16px 0',
      lineHeight: 1.3
    },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '10px',
      fontSize: '0.9rem'
    },
    metaIcon: { fontSize: '1.1rem' },
    metaLabel: { fontWeight: '600', color: '#d1d5db', minWidth: '60px' },
    metaValue: { color: 'white', fontWeight: '500' },
    ratingDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderRadius: '16px',
      color: 'white',
      fontWeight: '600',
      marginBottom: '24px'
    },
    interactionPanel: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '24px',
      marginBottom: '24px'
    },
    sectionLabel: {
      display: 'block',
      fontWeight: '600',
      color: 'white',
      marginBottom: '12px',
      fontSize: '1rem'
    },
    ratingControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '24px'
    },
    ratingSelect: {
      flex: 1,
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    commentControls: { display: 'flex', flexDirection: 'column', gap: '12px' },
    commentInput: {
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px',
      transition: 'all 0.3s ease'
    },
    primaryButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.25)'
    },
    secondaryButton: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.25)'
    },
    commentsDisplay: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '24px',
      marginBottom: '24px'
    },
    commentsTitle: {
      color: 'white',
      fontSize: '1.1rem',
      marginBottom: '16px',
      fontWeight: '600'
    },
    commentsList: { maxHeight: '300px', overflowY: 'auto', padding: '4px' },
    commentItem: {
      display: 'flex',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    commentAvatar: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      flexShrink: 0
    },
    commentContent: { flex: 1, minWidth: 0 },
    commentAuthor: {
      fontWeight: '600',
      color: '#c4b5fd',
      fontSize: '0.9rem',
      marginBottom: '4px'
    },
    commentText: { color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.5, wordWrap: 'break-word' },
    noComments: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#9ca3af',
      fontStyle: 'italic',
      padding: '20px',
      textAlign: 'center',
      justifyContent: 'center'
    },
    videoActions: { borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' },
    featuredButton: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      color: '#1f2937',
      border: 'none',
      borderRadius: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1.1rem',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none',
      boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.25)'
    },
    emptyState: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '64px 32px',
      textAlign: 'center',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    emptyIcon: { fontSize: '4rem', marginBottom: '16px', opacity: 0.6 },
    emptyTitle: { color: 'white', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '600' },
    emptyDescription: { color: '#9ca3af', fontSize: '1.1rem' }
  };

  function HoverPlayVideo({ src, poster }) {
    return (
      <video
        style={styles.videoPlayer}
        muted
        playsInline
        preload="metadata"
        poster={poster || PLACEHOLDER_POSTER}
        onMouseEnter={(e) => {
          if (src) e.currentTarget.play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          try {
            e.currentTarget.currentTime = 0;
          } catch {}
        }}
      >
        {src ? <source src={src} type="video/mp4" /> : null}
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          .search-input:focus,
          .rating-select:focus,
          .comment-input:focus {
            outline: none;
            border-color: rgba(147, 51, 234, 0.6) !important;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.2) !important;
          }
          .search-input::placeholder, .comment-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          .video-card:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.4) !important;
          }
          .primary-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.4) !important;
          }
          .secondary-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(6, 182, 212, 0.4) !important;
          }
          .featured-button:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 25px 50px -12px rgba(251, 191, 36, 0.4) !important;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .logout-btn:hover {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            transform: scale(1.05) !important;
          }
          .comments-list::-webkit-scrollbar { width: 6px; }
          .comments-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1); border-radius: 3px;
          }
          .comments-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3); border-radius: 3px;
          }
          .comments-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          @media (max-width: 768px) {
            .title { font-size: 2.5rem !important; }
            .subtitle { font-size: 1.1rem !important; }
            .videos-grid { grid-template-columns: 1fr !important; }
            .search-grid { grid-template-columns: 1fr !important; }
            .meta-grid { grid-template-columns: 1fr !important; }
            .rating-controls { flex-direction: column !important; align-items: stretch !important; }
            .navbar { flex-direction: column; gap: 16px; padding: 16px; }
            .nav-left, .nav-right { flex-wrap: wrap; justify-content: center; }
            .content { padding: 16px !important; }
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
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span style={styles.navBrandText}>VidShare</span>
          </Link>
        </div>

        <div style={styles.navRight}>
          {!role && (
            <>
              <Link to="/login" style={styles.navLink} className="nav-link">Login</Link>
              <Link to="/register" style={styles.navLink} className="nav-link">Register</Link>
              <Link to="/forgot-password" style={styles.navLink} className="nav-link">Forgot?</Link>
            </>
          )}

          {role === 'consumer' && (
            <Link to="/dashboard" style={styles.navLink} className="nav-link">📺 Dashboard</Link>
          )}

          {role === 'creator' && (
            <>
              <Link to="/upload" style={styles.navLink} className="nav-link">⬆ Upload</Link>
              <Link to="/creator-dashboard" style={styles.navLink} className="nav-link">📊 Creator</Link>
              <Link to="/stats" style={styles.navLink} className="nav-link">📈 Stats</Link>
            </>
          )}

          {role && (
            <button
              onClick={() => window.confirm('Are you sure you want to logout?') && handleLogout()}
              style={styles.logoutBtn}
              className="logout-btn"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.title} className="title">🔥 Video Dashboard</h1>
          <p style={styles.subtitle} className="subtitle">
            Discover, rate, and engage with amazing video content from creators worldwide
          </p>
        </div>

        {/* Search Section */}
        <div style={styles.searchSection}>
          <h3 style={styles.searchTitle}>🔍 Find Your Perfect Content</h3>
          <div style={styles.searchGrid} className="search-grid">
            <div style={styles.searchField}>
              <label style={styles.searchLabel}>Title</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={styles.searchInput}
                className="search-input"
              />
            </div>
            <div style={styles.searchField}>
              <label style={styles.searchLabel}>Genre</label>
              <input
                type="text"
                placeholder="Search by genre..."
                value={searchGenre}
                onChange={(e) => setSearchGenre(e.target.value)}
                style={styles.searchInput}
                className="search-input"
              />
            </div>
            <div style={styles.searchField}>
              <label style={styles.searchLabel}>Age Rating</label>
              <input
                type="text"
                placeholder="Search by age rating..."
                value={searchAgeRating}
                onChange={(e) => setSearchAgeRating(e.target.value)}
                style={styles.searchInput}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorBanner}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Videos Section */}
        <div style={styles.videosSection}>
          {filteredVideos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📹</div>
              <h3 style={styles.emptyTitle}>No videos found</h3>
              <p style={styles.emptyDescription}>Try adjusting your search criteria to discover amazing content.</p>
            </div>
          ) : (
            <div style={styles.videosGrid} className="videos-grid">
              {filteredVideos.map((video) => (
                <div className="video-card" style={styles.videoCard} key={video._id}>
                  {/* Video Player with thumbnail + hover autoplay */}
                  <div style={styles.videoContainer}>
                    <HoverPlayVideo
                      src={video.playUrl || null}
                      poster={video.thumbUrl || PLACEHOLDER_POSTER}
                    />
                  </div>

                  {/* Video Details */}
                  <div style={styles.videoDetails}>
                    <h3 style={styles.videoTitle}>{video.title}</h3>

                    <div style={styles.metaGrid} className="meta-grid">
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>🎬</span>
                        <span style={styles.metaLabel}>Publisher</span>
                        <span style={styles.metaValue}>{video.publisher || 'N/A'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>🎞️</span>
                        <span style={styles.metaLabel}>Producer</span>
                        <span style={styles.metaValue}>{video.producer || 'N/A'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>📁</span>
                        <span style={styles.metaLabel}>Genre</span>
                        <span style={styles.metaValue}>{video.genre || 'N/A'}</span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={styles.metaIcon}>🔞</span>
                        <span style={styles.metaLabel}>Age Rating</span>
                        <span style={styles.metaValue}>{video.ageRating || 'N/A'}</span>
                      </div>
                    </div>

                    <div style={styles.ratingDisplay}>
                      <span style={{ fontSize: '1.25rem' }}>⭐</span>
                      <span>{calculateAverageRating(video)}</span>
                    </div>

                    {/* Interaction Panel */}
                    <div style={styles.interactionPanel}>
                      {/* Rating Section */}
                      <div>
                        <label style={styles.sectionLabel}>Rate this video</label>
                        <div style={styles.ratingControls} className="rating-controls">
                          <select
                            value={ratings[video._id] || 0}
                            onChange={(e) =>
                              setRatings({ ...ratings, [video._id]: Number(e.target.value) })
                            }
                            style={styles.ratingSelect}
                            className="rating-select"
                          >
                            <option value="0">Select Rating</option>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <option key={s} value={s}>⭐ {s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRating(video._id)}
                            style={styles.primaryButton}
                            className="primary-button"
                          >
                            Submit Rating
                          </button>
                        </div>
                      </div>

                      {/* Comment Section */}
                      <div>
                        <label style={styles.sectionLabel}>Add a comment</label>
                        <div style={styles.commentControls}>
                          <textarea
                            rows="4"
                            placeholder="Share your thoughts about this video..."
                            value={newComments[video._id] || ''}
                            onChange={(e) =>
                              setNewComments({ ...newComments, [video._id]: e.target.value })
                            }
                            style={styles.commentInput}
                            className="comment-input"
                          />
                          <button
                            onClick={() => handleComment(video._id)}
                            style={styles.secondaryButton}
                            className="secondary-button"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments Display */}
                    <div style={styles.commentsDisplay}>
                      <h4 style={styles.commentsTitle}>💬 Comments ({video.comments?.length || 0})</h4>
                      <div style={styles.commentsList} className="comments-list">
                        {video.comments?.length > 0 ? (
                          video.comments.map((c, i) => (
                            <div key={i} style={styles.commentItem}>
                              <div style={styles.commentAvatar}>👤</div>
                              <div style={styles.commentContent}>
                                <div style={styles.commentAuthor}>{c.user}</div>
                                <div style={styles.commentText}>{c.text}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={styles.noComments}>
                            <span style={{ fontSize: '1.25rem' }}>💭</span>
                            <span>No comments yet. Be the first to comment!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.videoActions}>
                      <Link
                        to={`/video/${video._id}`}
                        style={styles.featuredButton}
                        className="featured-button"
                      >
                        <span style={{ fontSize: '1.1rem' }}>▶</span>
                        Watch Fullscreen
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
