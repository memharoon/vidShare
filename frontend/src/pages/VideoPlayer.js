// src/pages/VideoPlayer.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

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

  useEffect(() => {
    axios.get(`http://localhost:5000/api/videos`)
      .then(res => {
        const found = res.data.find(v => v._id === id);
        if (found) setVideo(found);
        else setError('⚠️ Video not found.');
      })
      .catch(err => {
        console.error(err);
        setError('❌ Failed to load video.');
      });

    // Increment view count
    axios.post(`http://localhost:5000/api/videos/${id}/view`)
      .catch(err => console.error('View count update failed:', err));
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleComment = async () => {
    const user = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1]))?.email : '';
    if (!newComment.trim() || !user) {
      alert('Please write a comment and ensure you are logged in.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/videos/${id}/comment`, { user, text: newComment });
      setVideo((prev) => ({
        ...prev,
        comments: [...prev.comments, { user, text: newComment }],
      }));
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Error submitting comment.');
    }
  };

  const handleRating = async () => {
    const user = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1]))?.email : '';
    if (!rating || !user) {
      alert('Set a rating and make sure you are logged in.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/videos/${id}/rate`, { user, score: rating });
      setVideo((prev) => ({
        ...prev,
        ratings: [...prev.ratings, { user, score: rating }],
      }));
      setRating(0);
    } catch (err) {
      console.error(err);
      alert('Error submitting rating.');
    }
  };

  const calculateAverageRating = () => {
    if (!video?.ratings?.length) return 'N/A';
    const total = video.ratings.reduce((sum, r) => sum + r.score, 0);
    return (total / video.ratings.length).toFixed(1);
  };

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
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px'
    },
    navBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none'
    },
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
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    navLink: {
      color: '#d1d5db',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    backButton: {
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
      maxWidth: '1200px',
      margin: '0 auto'
    },
    hero: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out',
      marginBottom: '32px'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd, #fbbf24)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: '0 0 16px 0',
      textAlign: 'center',
      lineHeight: 1.2
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
    videoContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.2s',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      marginBottom: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    videoPlayer: {
      width: '100%',
      height: 'auto',
      minHeight: '400px',
      backgroundColor: '#000',
      borderRadius: '20px 20px 0 0'
    },
    videoMeta: {
      padding: '24px'
    },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    metaCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    metaTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    metaValue: {
      fontSize: '1rem',
      color: '#d1d5db',
      fontWeight: '500'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      color: '#1f2937',
      boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.25)',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '0.9rem',
      fontWeight: '600',
      opacity: 0.8
    },
    interactionSection: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.4s',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    interactionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    ratingSection: {
      marginBottom: '32px'
    },
    sectionLabel: {
      display: 'block',
      fontWeight: '600',
      color: 'white',
      marginBottom: '12px',
      fontSize: '1.1rem'
    },
    ratingControls: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    ratingSelect: {
      flex: 1,
      maxWidth: '200px',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    commentSection: {
      marginBottom: '24px'
    },
    commentInput: {
      width: '100%',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
      transition: 'all 0.3s ease',
      marginBottom: '16px'
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
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.6s',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    commentsTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    commentsList: {
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '8px'
    },
    commentItem: {
      display: 'flex',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    commentAvatar: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      flexShrink: 0
    },
    commentContent: {
      flex: 1,
      minWidth: 0
    },
    commentAuthor: {
      fontWeight: '600',
      color: '#c4b5fd',
      fontSize: '1rem',
      marginBottom: '6px'
    },
    commentText: {
      color: '#d1d5db',
      fontSize: '1rem',
      lineHeight: 1.6,
      wordWrap: 'break-word'
    },
    noComments: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#9ca3af',
      fontStyle: 'italic',
      padding: '32px',
      textAlign: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .rating-select:focus,
          .comment-input:focus {
            outline: none !important;
            border-color: rgba(147, 51, 234, 0.6) !important;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.2) !important;
          }
          
          .comment-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          .primary-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.4) !important;
          }
          
          .secondary-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(6, 182, 212, 0.4) !important;
          }
          
          .back-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(6, 182, 212, 0.4) !important;
          }
          
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          
          .logout-btn:hover {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            transform: scale(1.05) !important;
          }
          
          .meta-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.2) !important;
          }
          
          .stat-card:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(251, 191, 36, 0.4) !important;
          }
          
          .comments-list::-webkit-scrollbar {
            width: 8px;
          }
          
          .comments-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          .comments-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          
          .comments-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          
          @media (max-width: 768px) {
            .title { font-size: 2rem !important; }
            .meta-grid { grid-template-columns: 1fr !important; }
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span style={styles.navBrandText}>VidShare</span>
          </Link>
        </div>

        <div style={styles.navRight}>
          <Link to="/dashboard" style={styles.backButton} className="back-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7"/>
            </svg>
            Back to Dashboard
          </Link>

          {!role && (
            <>
              <Link to="/login" style={styles.navLink} className="nav-link">Login</Link>
              <Link to="/register" style={styles.navLink} className="nav-link">Register</Link>
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
        {/* Error Display */}
        {error && (
          <div style={styles.errorBanner}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {video && (
          <>
            {/* Hero Section */}
            <div style={styles.hero}>
              <h1 style={styles.title}>{video.title}</h1>
            </div>

            {/* Video Player Container */}
            <div style={styles.videoContainer}>
              <video controls style={styles.videoPlayer}>
                <source src={`http://localhost:5000${video.videoUrl}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div style={styles.videoMeta}>
                {/* Video Metadata Grid */}
                <div style={styles.metaGrid}>
                  <div style={styles.metaCard} className="meta-card">
                    <div style={styles.metaTitle}>
                      <span>🎬</span>
                      Publisher
                    </div>
                    <div style={styles.metaValue}>{video.publisher || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.metaCard} className="meta-card">
                    <div style={styles.metaTitle}>
                      <span>🎞️</span>
                      Producer
                    </div>
                    <div style={styles.metaValue}>{video.producer || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.metaCard} className="meta-card">
                    <div style={styles.metaTitle}>
                      <span>📁</span>
                      Genre
                    </div>
                    <div style={styles.metaValue}>{video.genre || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.metaCard} className="meta-card">
                    <div style={styles.metaTitle}>
                      <span>🔞</span>
                      Age Rating
                    </div>
                    <div style={styles.metaValue}>{video.ageRating || 'N/A'}</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid} className="stats-grid">
                  <div style={styles.statCard} className="stat-card">
                    <div style={styles.statNumber}>👁️ {video.views || 0}</div>
                    <div style={styles.statLabel}>Views</div>
                  </div>
                  
                  <div style={styles.statCard} className="stat-card">
                    <div style={styles.statNumber}>⭐ {calculateAverageRating()}</div>
                    <div style={styles.statLabel}>Rating</div>
                  </div>
                  
                  <div style={styles.statCard} className="stat-card">
                    <div style={styles.statNumber}>💬 {video.comments?.length || 0}</div>
                    <div style={styles.statLabel}>Comments</div>
                  </div>
                  
                  <div style={styles.statCard} className="stat-card">
                    <div style={styles.statNumber}>🌟 {video.ratings?.length || 0}</div>
                    <div style={styles.statLabel}>Ratings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Section */}
            <div style={styles.interactionSection}>
              <h3 style={styles.interactionTitle}>
                <span>🎯</span>
                Rate & Comment
              </h3>

              {/* Rating Section */}
              <div style={styles.ratingSection}>
                <label style={styles.sectionLabel}>Rate this video</label>
                <div style={styles.ratingControls}>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={styles.ratingSelect}
                    className="rating-select"
                  >
                    <option value="0">Select Rating</option>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>⭐ {s}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleRating} 
                    style={styles.primaryButton}
                    className="primary-button"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              <div style={styles.commentSection}>
                <label style={styles.sectionLabel}>Add a comment</label>
                <textarea
                  rows="4"
                  placeholder="Share your thoughts about this video..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={styles.commentInput}
                  className="comment-input"
                />
                <button 
                  onClick={handleComment} 
                  style={styles.secondaryButton}
                  className="secondary-button"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments Display */}
            <div style={styles.commentsDisplay}>
              <h3 style={styles.commentsTitle}>
                <span>💬</span>
                Comments ({video.comments?.length || 0})
              </h3>
              
              <div style={styles.commentsList} className="comments-list">
                {video.comments?.length === 0 ? (
                  <div style={styles.noComments}>
                    <span style={{ fontSize: '1.5rem' }}>💭</span>
                    <span>No comments yet. Be the first to share your thoughts!</span>
                  </div>
                ) : (
                  video.comments.map((c, idx) => (
                    <div key={idx} style={styles.commentItem}>
                      <div style={styles.commentAvatar}>👤</div>
                      <div style={styles.commentContent}>
                        <div style={styles.commentAuthor}>{c.user}</div>
                        <div style={styles.commentText}>{c.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;