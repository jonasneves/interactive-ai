import { useState, useEffect, useRef, useCallback } from 'react';
import HandBackground from './components/HandBackground';
import CourseTrack, { COURSES } from './components/CourseTrack';
import auth from '../shared/auth.js';

const REDIRECT_URI = window.location.origin + window.location.pathname;

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu')) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="user-menu" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.375rem 0.75rem 0.375rem 0.375rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          cursor: 'pointer',
          color: '#e2e8f0'
        }}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}>
          {user.displayName[0].toUpperCase()}
        </div>
        <span style={{ fontSize: '0.875rem' }}>{user.displayName}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 4,
          minWidth: 120
        }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              color: '#94a3b8',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ href, icon, title, description, isHovered, cardRef }) {
  return (
    <a
      ref={cardRef}
      href={href}
      data-card-id={href}
      style={{
        display: 'block',
        padding: '1.5rem',
        background: isHovered
          ? 'rgba(30, 41, 59, 0.7)'
          : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(12px)',
        border: isHovered
          ? '1px solid rgba(99, 102, 241, 0.4)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        textDecoration: 'none',
        color: '#fff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(99, 102, 241, 0.15), 0 0 30px rgba(99, 102, 241, 0.1)'
          : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isHovered) {
          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isHovered) {
          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{
        fontSize: '2rem',
        marginBottom: '0.75rem',
        transition: 'transform 0.3s',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        marginBottom: '0.375rem',
        color: isHovered ? '#fff' : '#f1f5f9',
        transition: 'color 0.3s'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.8125rem',
        color: isHovered ? '#94a3b8' : '#64748b',
        lineHeight: 1.5,
        transition: 'color 0.3s'
      }}>
        {description}
      </div>
    </a>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardRefs = useRef({});

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

  // Hand position handler - detects hovering over course track and cards
  const handleHandPosition = useCallback((x, y, gesture) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;

    // Check course track for gesture navigation
    const courseTrack = document.querySelector('[data-gesture-course-track]');
    if (courseTrack) {
      const rect = courseTrack.getBoundingClientRect();
      if (screenX >= rect.left && screenX <= rect.right &&
          screenY >= rect.top && screenY <= rect.bottom) {
        const relativeX = (screenX - rect.left) / rect.width;
        const courseIndex = Math.min(
          Math.floor(relativeX * COURSES.length),
          COURSES.length - 1
        );
        const targetCourse = COURSES[Math.max(0, courseIndex)];
        if (targetCourse && targetCourse.id !== activeCourse) {
          setActiveCourse(targetCourse.id);
        }
      }
    }

    // Check cards for hover effect
    let foundCard = null;
    for (const [id, ref] of Object.entries(cardRefs.current)) {
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      // Expand hit area slightly for better UX
      const padding = 20;
      if (screenX >= rect.left - padding && screenX <= rect.right + padding &&
          screenY >= rect.top - padding && screenY <= rect.bottom + padding) {
        foundCard = id;
        break;
      }
    }

    if (foundCard !== hoveredCard) {
      setHoveredCard(foundCard);
    }
  }, [activeCourse, hoveredCard]);

  // Dwell click handler - triggers navigation
  const handleDwellClick = useCallback((x, y) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;

    // Check if dwelling on a card
    for (const [id, ref] of Object.entries(cardRefs.current)) {
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (screenX >= rect.left && screenX <= rect.right &&
          screenY >= rect.top && screenY <= rect.bottom) {
        // Navigate to the card's href
        window.location.href = ref.getAttribute('href');
        return;
      }
    }

    // Check if dwelling on course track
    const courseTrack = document.querySelector('[data-gesture-course-track]');
    if (courseTrack) {
      const rect = courseTrack.getBoundingClientRect();
      if (screenX >= rect.left && screenX <= rect.right &&
          screenY >= rect.top && screenY <= rect.bottom) {
        // Navigate to active course
        const course = COURSES.find(c => c.id === activeCourse);
        if (course) {
          window.location.href = course.href;
        }
      }
    }
  }, [activeCourse]);

  // Course selection from track
  const handleCourseSelect = useCallback((course) => {
    window.location.href = course.href;
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ color: '#475569' }}>Loading...</div>
      </div>
    );
  }

  const CARDS = [
    {
      id: './neural-networks/',
      href: './neural-networks/',
      icon: '🧠',
      title: 'Neural Networks',
      description: 'Backpropagation, activation functions, and gradient descent visualized.'
    },
    {
      id: './convolutional-networks/',
      href: './convolutional-networks/',
      icon: '👁️',
      title: 'CNNs',
      description: 'Convolutions, kernels, pooling, and architectures explained.'
    },
    {
      id: './reinforcement-learning/',
      href: './reinforcement-learning/',
      icon: '🎮',
      title: 'Reinforcement Learning',
      description: 'MDPs, value functions, Q-learning, and policy gradients.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
        radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.06) 0px, transparent 50%),
        radial-gradient(at 40% 80%, rgba(6, 182, 212, 0.04) 0px, transparent 50%),
        radial-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 24px 24px'
    }}>
      <HandBackground
        enabled={handTrackingEnabled}
        onHandPosition={handleHandPosition}
        onDwellClick={handleDwellClick}
      />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>
          InteractiveAI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {handTrackingEnabled && (
            <button
              onClick={() => setHandTrackingEnabled(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 6,
                color: '#60a5fa',
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              On
            </button>
          )}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <button
              onClick={handleLogin}
              style={{
                padding: '0.375rem 0.875rem',
                background: '#1d4ed8',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4rem 1.5rem 4rem',
        position: 'relative',
        zIndex: 5
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 700,
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em'
        }}>
          InteractiveAI
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#475569',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Educational visualizations for understanding AI
        </p>

        {/* Course Track - Gesture Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <CourseTrack
            activeCourse={activeCourse}
            onCourseChange={setActiveCourse}
            onCourseSelect={handleCourseSelect}
          />
          {handTrackingEnabled && (
            <p style={{
              fontSize: '0.75rem',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              Point to navigate • Hold to select
            </p>
          )}
        </div>

        {/* Hands-free CTA */}
        {!handTrackingEnabled && (
          <button
            onClick={() => setHandTrackingEnabled(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.75rem 1.25rem',
              marginBottom: '2.5rem',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.15)';
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                Try Hands-Free Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Control with gestures
              </div>
            </div>
          </button>
        )}

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          maxWidth: 880,
          width: '100%'
        }}>
          {CARDS.map(card => (
            <Card
              key={card.id}
              cardRef={el => cardRefs.current[card.id] = el}
              href={card.href}
              icon={card.icon}
              title={card.title}
              description={card.description}
              isHovered={handTrackingEnabled && hoveredCard === card.id}
            />
          ))}
        </div>

        {/* Login prompt */}
        {!user && (
          <div style={{
            marginTop: '2.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Sign in to save your progress
            </p>
            <button
              onClick={handleLogin}
              style={{
                padding: '0.375rem 1rem',
                background: '#1d4ed8',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Duke NetID
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
