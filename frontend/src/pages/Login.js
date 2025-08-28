import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api'; // ✅ use shared axios instance (baseURL + auth interceptor)

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', credentials);
      const token = data?.token;
      if (!token) throw new Error('No token returned');

      localStorage.setItem('token', token);

      // Prefer backend-provided role; fallback to JWT payload if needed.
      let role = data?.role;
      if (!role) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || ''));
          role = payload?.role || '';
        } catch {
          role = '';
        }
      }
      if (role) localStorage.setItem('role', role);
      localStorage.setItem('isLoggedIn', 'true');

      setMessage('✅ Login successful!');
      if (role === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || '❌ Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
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
    // Main content styles
    content: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '40px 20px',
    },
    loginContainer: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 1s ease-out',
      width: '100%',
      maxWidth: '420px',
      padding: '40px',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '32px'
    },
    logoIcon: {
      padding: '12px',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      borderRadius: '50%',
      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #c4b5fd)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    subtitle: {
      textAlign: 'center',
      color: '#d1d5db',
      marginBottom: '32px',
      fontSize: '1rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      position: 'relative'
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
    submitButton: {
      width: '100%',
      padding: '16px',
      background: isLoading ? 'rgba(147, 51, 234, 0.6)' : 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '8px'
    },
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
    forgotPasswordLink: {
      textAlign: 'center',
      marginTop: '20px'
    },
    link: {
      color: '#c4b5fd',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      gap: '16px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: 'rgba(255, 255, 255, 0.2)'
    },
    dividerText: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    signupSection: {
      textAlign: 'center',
      marginTop: '24px',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    signupText: {
      color: '#d1d5db',
      marginBottom: '12px'
    },
    signupButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .input:focus {
            border-color: rgba(147, 51, 234, 0.6) !important;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1) !important;
          }
          .input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 40px rgba(147, 51, 234, 0.4) !important;
          }
          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
          }
          .link:hover {
            color: #a855f7 !important;
          }
          .signup-button:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px) !important;
          }
          @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 16px; padding: 16px; }
            .nav-left, .nav-right { flex-wrap: wrap; justify-content: center; }
            .login-container { margin: 20px; padding: 32px 24px; }
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
          <Link to="/register" style={styles.navLink} className="nav-link">Register</Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.loginContainer} className="login-container">
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
          </div>
          
          <p style={styles.subtitle}>
            Sign in to your VidShare account
          </p>

          {message && <div style={styles.message}>{message}</div>}
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleChange}
                required
                style={styles.input}
                className="input"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
                style={styles.input}
                className="input"
              />
            </div>
            
            <button 
              type="submit" 
              style={styles.submitButton}
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l4-4-4-4m5 8H3"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <div style={styles.signupSection}>
            <p style={styles.signupText}>Don't have an account?</p>
            <Link to="/register" style={styles.signupButton} className="signup-button">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
