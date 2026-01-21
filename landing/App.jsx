import { useState, useEffect } from 'react';
import HandBackground from './components/HandBackground';
import auth from '../shared/auth.js';

const REDIRECT_URI = window.location.origin + window.location.pathname;

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 10
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#94a3b8'
  },
  btn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  btnDuke: {
    background: '#00539B',
    color: 'white'
  },
  btnGhost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  userMenu: {
    position: 'relative'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00539B, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.875rem'
  },
  userName: {
    fontSize: '0.875rem',
    color: '#e2e8f0'
  },
  userId: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '0.5rem',
    minWidth: '140px',
    transition: 'all 0.2s'
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    minHeight: 'calc(100vh - 64px)',
    position: 'relative',
    zIndex: 10
  },
  h1: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: '3rem',
    fontSize: '1.25rem'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    width: '100%'
  },
  card: {
    background: 'rgba(30, 41, 59, 0.3)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2rem',
    textDecoration: 'none',
    color: '#fff',
    transition: 'all 0.3s ease'
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem'
  },
  cardDesc: {
    color: '#94a3b8',
    lineHeight: 1.6
  },
  loginPrompt: {
    marginTop: '3rem',
    padding: '1.5rem 2rem',
    background: 'rgba(30, 41, 59, 0.25)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '400px'
  },
  loginPromptText: {
    color: '#94a3b8',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  }
};

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="user-menu" style={styles.userMenu}>
      <div onClick={() => setOpen(!open)} style={styles.userInfo}>
        <div style={styles.userAvatar}>
          {user.displayName[0].toUpperCase()}
        </div>
        <div>
          <div style={styles.userName}>{user.displayName}</div>
          <div style={styles.userId}>{user.id}@duke.edu</div>
        </div>
      </div>
      <div style={{
        ...styles.dropdown,
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transform: open ? 'translateY(0)' : 'translateY(-8px)'
      }}>
        <button onClick={onLogout} style={{ ...styles.btn, ...styles.btnGhost, width: '100%' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function Card({ href, icon, title, description }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-5px)' : 'none',
        borderColor: hovered ? 'rgba(124, 58, 237, 0.5)' : 'rgba(255,255,255,0.1)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.3)' : 'none'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardDesc}>{description}</div>
    </a>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const callbackUser = await auth.handleCallback(REDIRECT_URI);
        setUser(callbackUser || auth.getUser());
      } catch (err) {
        console.error('Auth callback error:', err);
        setUser(auth.getUser());
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleLogin = () => auth.login(REDIRECT_URI);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <HandBackground enabled={handTrackingEnabled} />

      <header style={styles.header}>
        <div style={styles.logo}>InteractiveAI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {handTrackingEnabled && (
            <button
              onClick={() => setHandTrackingEnabled(false)}
              style={{
                ...styles.btn,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              Hands-Free On
            </button>
          )}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <button onClick={handleLogin} style={{ ...styles.btn, ...styles.btnDuke }}>
              Duke NetID
            </button>
          )}
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.h1}>InteractiveAI</h1>
        <p style={styles.subtitle}>Educational Visualizations for Understanding AI Concepts</p>

        {!handTrackingEnabled && (
          <button
            onClick={() => setHandTrackingEnabled(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 2rem',
              marginBottom: '2.5rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Try Hands-Free Mode
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Learn AI with gesture controls
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.5rem' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div style={styles.cards}>
          <Card
            href="./neural-networks/"
            icon="🧠"
            title="Neural Networks"
            description="Explore backpropagation, activation functions, loss landscapes, and gradient descent through interactive visualizations."
          />
          <Card
            href="./convolutional-networks/"
            icon="👁️"
            title="Convolutional Networks"
            description="Understand CNNs from pixels to predictions - convolutions, kernels, pooling, and famous architectures."
          />
          <Card
            href="./reinforcement-learning/"
            icon="🎮"
            title="Reinforcement Learning"
            description="Learn RL fundamentals - MDPs, value functions, Q-learning, policy gradients, and exploration strategies."
          />
        </div>

        {!user && (
          <div style={styles.loginPrompt}>
            <p style={styles.loginPromptText}>
              Sign in with your Duke NetID to save your progress and preferences.
            </p>
            <button onClick={handleLogin} style={{ ...styles.btn, ...styles.btnDuke }}>
              Duke NetID
            </button>
          </div>
        )}
      </main>
    </>
  );
}
