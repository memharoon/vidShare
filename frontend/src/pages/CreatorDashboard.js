import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function CreatorDashboard() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    axios.get('http://localhost:5000/api/videos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        setVideos(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch videos:', err);
        setMessage('❌ Could not load your videos.');
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleClearFilters = () => {
    setSearch('');
    setGenreFilter('');
  };

  const filteredVideos = videos.filter((video) => {
    return (
      video.title?.toLowerCase().includes(search.toLowerCase()) &&
      video.genre?.toLowerCase().includes(genreFilter.toLowerCase())
    );
  });

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
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    uploadButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px'
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
      padding: '40px 32px',
      maxWidth: '1400px',
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
    subtitle: {
      color: '#d1d5db',
      fontSize: '1.1rem',
      marginBottom: '32px'
    },
    // Search and filters
    filtersContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.3s',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '24px',
      marginBottom: '32px',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center'
    },
    searchInput: {
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      minWidth: '200px'
    },
    clearButton: {
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    },
    // Message styles
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      background: message.includes('✅') 
        ? 'rgba(34, 197, 94, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)',
      border: message.includes('✅') 
        ? '1px solid rgba(34, 197, 94, 0.3)' 
        : '1px solid rgba(239, 68, 68, 0.3)',
      color: message.includes('✅') ? '#22c55e' : '#ef4444',
      marginBottom: '20px'
    },
    // Loading styles
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      flexDirection: 'column',
      gap: '16px'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid #a855f7',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      color: '#d1d5db',
      fontSize: '1.1rem'
    },
    // Video grid styles
    videoGrid: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.5s',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
      marginTop: '32px'
    },
    videoCard: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    videoElement: {
      width: '100%',
      borderRadius: '12px',
      marginBottom: '16px',
      maxHeight: '200px'
    },
    videoTitle: {
      color: 'white',
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '8px',
      lineHeight: 1.3
    },
    videoInfo: {
      color: '#9ca3af',
      fontSize: '0.9rem',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    videoInfoLabel: {
      color: '#d1d5db',
      fontWeight: '500',
      minWidth: '80px'
    },
    viewButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      fontSize: '14px',
      marginTop: '16px',
      transition: 'all 0.3s ease'
    },
    statsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '12px'
    },
    statBadge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    viewsBadge: {
      background: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    },
    dateBadge: {
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#3b82f6',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af'
    },
    emptyStateIcon: {
      fontSize: '4rem',
      marginBottom: '16px'
    },
    emptyStateTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#d1d5db',
      marginBottom: '8px'
    },
    emptyStateText: {
      fontSize: '1rem',
      marginBottom: '24px'
    },
    uploadPromptButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .search-input:focus {
            border-color: rgba(147, 51, 234, 0.6) !important;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
          }
          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          .video-card:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            transform: translateY(-4px) !important;
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25) !important;
          }
          .view-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4) !important;
          }
          .upload-button:hover {
            background: linear-gradient(135deg, #059669, #047857) !important;
            transform: translateY(-2px) !important;
          }
          .clear-button:hover {
            background: linear-gradient(135deg, #d97706, #b45309) !important;
            transform: translateY(-2px) !important;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .logout-btn:hover {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            transform: scale(1.05) !important;
          }
          .upload-prompt-button:hover {
            background: linear-gradient(135deg, #059669, #047857) !important;
            transform: translateY(-2px) !important;
          }
          @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 16px; padding: 16px; }
            .nav-left, .nav-right { flex-wrap: wrap; justify-content: center; }
            .filters-container { flex-direction: column; }
            .search-input { min-width: 100%; }
            .video-grid { grid-template-columns: 1fr; }
            .content { padding: 20px 16px; }
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
          <Link to="/dashboard" style={styles.navLink} className="nav-link">
            <span>📺</span>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/upload" style={styles.uploadButton} className="upload-button">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>Upload</span>
          </Link>

          <Link to="/stats" style={styles.navLink} className="nav-link">
            <span>📈</span>
            <span>Stats</span>
          </Link>

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
          <h1 style={styles.title}>
            <span>📁</span>
            <span>Your Video Library</span>
          </h1>
          <p style={styles.subtitle}>
            Manage and track your uploaded content
          </p>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {/* Search & Filter Section */}
        <div style={styles.filtersContainer} className="filters-container">
          <input
            type="text"
            placeholder="🔍 Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="search-input"
          />
          <input
            type="text"
            placeholder="🎭 Filter by genre..."
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={styles.searchInput}
            className="search-input"
          />
          <button 
            style={styles.clearButton} 
            className="clear-button"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading your videos...</p>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && (
          <>
            {filteredVideos.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🎬</div>
                <h3 style={styles.emptyStateTitle}>
                  {videos.length === 0 ? 'No videos uploaded yet' : 'No videos match your filters'}
                </h3>
                <p style={styles.emptyStateText}>
                  {videos.length === 0 
                    ? 'Start building your video library by uploading your first video!' 
                    : 'Try adjusting your search criteria to find more videos.'
                  }
                </p>
                {videos.length === 0 && (
                  <Link to="/upload" style={styles.uploadPromptButton} className="upload-prompt-button">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <span>Upload Your First Video</span>
                  </Link>
                )}
              </div>
            ) : (
              <div style={styles.videoGrid}>
                {filteredVideos.map((video) => (
                  <div style={styles.videoCard} key={video._id} className="video-card">
                    <video style={styles.videoElement} controls>
                      <source src={`http://localhost:5000${video.videoUrl}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                    
                    <div style={styles.videoInfo}>
                      <span style={styles.videoInfoLabel}>Genre:</span>
                      <span>{video.genre || 'Not specified'}</span>
                    </div>
                    
                    <div style={styles.videoInfo}>
                      <span style={styles.videoInfoLabel}>Rating:</span>
                      <span>{video.ageRating || 'Not rated'}</span>
                    </div>
                    
                    <div style={styles.statsContainer}>
                      <div style={{...styles.statBadge, ...styles.viewsBadge}}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>{video.views || 0} views</span>
                      </div>
                      <div style={{...styles.statBadge, ...styles.dateBadge}}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Link to={`/video/${video._id}`} style={styles.viewButton} className="view-button">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                      <span>Watch Video</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CreatorDashboard;