import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Stats() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
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
    axios.get('http://localhost:5000/api/videos')
      .then((res) => setVideos(res.data))
      .catch((err) => {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load stats');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const calculateAverageRating = (ratings = []) => {
    if (ratings.length === 0) return 'N/A';
    const total = ratings.reduce((sum, r) => sum + r.score, 0);
    return (total / ratings.length).toFixed(1);
  };

  // Calculate total stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
  const totalVideos = videos.length;
  const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

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
    // Header/Navbar styles
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
    // Content styles
    content: {
      position: 'relative',
      zIndex: 10,
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out',
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '3rem',
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
    subtitle: {
      fontSize: '1.25rem',
      color: '#d1d5db',
      marginBottom: '32px'
    },
    // Stats overview cards
    statsOverview: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.3s',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginBottom: '48px'
    },
    statCard: {
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px'
    },
    statLabel: {
      color: '#9ca3af',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    // Error styles
    errorContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.5s',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      borderRadius: '12px',
      marginBottom: '32px'
    },
    errorText: {
      color: '#fca5a5',
      textAlign: 'center',
      fontWeight: '500'
    },
    // Videos grid
    videosGrid: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.5s',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px'
    },
    videoCard: {
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    videoTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px',
      lineHeight: 1.4
    },
    videoInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoLabel: {
      fontWeight: '600',
      color: '#c4b5fd',
      minWidth: '80px'
    },
    infoValue: {
      color: '#d1d5db'
    },
    ratingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    // Empty state
    emptyState: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.5s',
      textAlign: 'center',
      padding: '60px 20px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    emptyIcon: {
      width: '64px',
      height: '64px',
      margin: '0 auto 24px',
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#d1d5db',
      marginBottom: '8px'
    },
    emptyText: {
      color: '#9ca3af'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .video-card:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateY(-4px) !important;
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25) !important;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .logout-btn:hover {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            transform: scale(1.05) !important;
          }
          @media (max-width: 768px) {
            .title { font-size: 2.5rem !important; }
            .videos-grid { grid-template-columns: 1fr !important; }
            .navbar { flex-direction: column; gap: 16px; padding: 16px; }
            .nav-left, .nav-right { flex-wrap: wrap; justify-content: center; }
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
        <div style={styles.header}>
          <h1 style={styles.title} className="title">
            📊 Creator Stats Dashboard
          </h1>
          <p style={styles.subtitle}>
            Track your video performance and engagement metrics
          </p>
        </div>

        {/* Stats Overview */}
        <div style={styles.statsOverview}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalVideos}</div>
            <div style={styles.statLabel}>Total Videos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalViews.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Views</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{averageViews}</div>
            <div style={styles.statLabel}>Avg Views/Video</div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <div style={styles.errorText}>{error}</div>
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 && !error ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No Videos Found</h3>
            <p style={styles.emptyText}>Start creating content to see your stats here</p>
          </div>
        ) : (
          /* Videos Grid */
          <div style={styles.videosGrid} className="videos-grid">
            {videos.map((video) => (
              <div key={video._id} style={styles.videoCard} className="video-card">
                <h3 style={styles.videoTitle}>{video.title}</h3>
                <div style={styles.videoInfo}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Genre:</span>
                    <span style={styles.infoValue}>{video.genre}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Views:</span>
                    <span style={styles.infoValue}>{(video.views || 0).toLocaleString()}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Rating:</span>
                    <div style={styles.ratingContainer}>
                      <span style={styles.infoValue}>
                        {calculateAverageRating(video.ratings)} / 5
                      </span>
                      {calculateAverageRating(video.ratings) !== 'N/A' && (
                        <div style={{display: 'flex', gap: '2px'}}>
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              width="16" 
                              height="16" 
                              fill={i < Math.round(calculateAverageRating(video.ratings)) ? '#fbbf24' : '#374151'} 
                              viewBox="0 0 24 24"
                            >
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;