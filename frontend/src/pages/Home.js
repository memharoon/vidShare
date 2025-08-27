import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '0 20px',
      textAlign: 'center'
    },
    hero: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '32px'
    },
    logoIcon: {
      padding: '16px',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      borderRadius: '50%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    title: {
      fontSize: '4rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd, #fbbf24)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    subtitle: {
      fontSize: '1.5rem',
      color: '#d1d5db',
      marginBottom: '16px',
      maxWidth: '600px',
      lineHeight: 1.6
    },
    description: {
      fontSize: '1.1rem',
      color: '#9ca3af',
      marginBottom: '48px',
      maxWidth: '500px'
    },
    buttonsContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.3s',
      display: 'flex',
      gap: '16px',
      marginBottom: '64px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    primaryButton: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.25)',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      textDecoration: 'none'
    },
    secondaryButton: {
      padding: '16px 32px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      textDecoration: 'none'
    },
    featuresGrid: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.5s',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      maxWidth: '900px',
      width: '100%'
    },
    featureCard: {
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    featureIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
      transition: 'transform 0.3s ease'
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '8px'
    },
    featureDescription: {
      color: '#9ca3af',
      lineHeight: 1.5
    },
    stats: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out 0.7s',
      display: 'flex',
      gap: '32px',
      marginTop: '64px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    statItem: {
      textAlign: 'center',
      padding: '16px'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    statLabel: {
      color: '#9ca3af',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
          .feature-card:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateY(-8px) !important;
          }
          .feature-icon:hover {
            transform: scale(1.1) !important;
          }
          .primary-button:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.4) !important;
          }
          .secondary-button:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: scale(1.05) !important;
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
            .title { font-size: 3rem !important; }
            .subtitle { font-size: 1.25rem !important; }
            .buttons-container { flex-direction: column; align-items: center; }
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
        <div style={styles.hero}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h1 style={styles.title} className="title">VidShare</h1>
          </div>
          
          <p style={styles.subtitle} className="subtitle">
            Share your stories, discover amazing content, and connect with creators worldwide
          </p>
          
          <p style={styles.description}>
            Join millions of users in the next generation of video sharing
          </p>
        </div>

        <div style={styles.buttonsContainer} className="buttons-container">
          <Link to="/login" style={styles.primaryButton} className="primary-button">
            <span>Login</span>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4-4-4m5 8H3"/>
            </svg>
          </Link>
          
          <Link to="/register" style={styles.secondaryButton} className="secondary-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>Sign Up</span>
          </Link>
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard} className="feature-card">
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'}} className="feature-icon">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Easy Upload</h3>
            <p style={styles.featureDescription}>Share your videos instantly with our intuitive upload system</p>
          </div>
          
          <div style={styles.featureCard} className="feature-card">
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #10b981, #059669)'}} className="feature-icon">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Global Community</h3>
            <p style={styles.featureDescription}>Connect with creators and viewers from around the world</p>
          </div>
          
          <div style={styles.featureCard} className="feature-card">
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}} className="feature-icon">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Premium Quality</h3>
            <p style={styles.featureDescription}>Experience crystal-clear video streaming and playback</p>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>10M+</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>100M+</div>
            <div style={styles.statLabel}>Videos Shared</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>50+</div>
            <div style={styles.statLabel}>Countries</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;