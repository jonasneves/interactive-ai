import { useState, useCallback } from 'react';
import { HandBackground } from '../shared/components';
import CourseTrack, { COURSES } from './components/CourseTrack';

// Import course content components
import { CourseContent as NeuralNetworksContent } from '../neural-networks/App';
import { CourseContent as CNNContent } from '../convolutional-networks/App';
import { CourseContent as RLContent } from '../reinforcement-learning/App';

const GESTURE_STORAGE_KEY = 'interactive-ai-gestures-enabled';

// Map course IDs to their content components
const COURSE_COMPONENTS = {
  'neural-networks': NeuralNetworksContent,
  'convolutional-networks': CNNContent,
  'reinforcement-learning': RLContent
};

function BotIcon({ size = 24, color = '#64748b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function getPersistedGestureState() {
  try {
    return localStorage.getItem(GESTURE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function HandIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

function GestureHint({ onClick, isEnabled }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '2.5rem 3rem',
        background: isEnabled
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(12px)',
        border: isEnabled
          ? '1px solid rgba(59, 130, 246, 0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 0.3s',
        maxWidth: 400
      }}
    >
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: isEnabled
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s'
      }}>
        <HandIcon size={36} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: isEnabled ? '#60a5fa' : '#e2e8f0',
          marginBottom: '0.5rem'
        }}>
          {isEnabled ? 'Gesture Control Active' : 'Hands-Free Experience'}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#64748b',
          lineHeight: 1.6
        }}>
          {isEnabled
            ? 'Move your hand to navigate. Hold still to select.'
            : 'Navigate using hand gestures. Click to enable your camera.'}
        </div>
      </div>
      {!isEnabled && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: 8,
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          <HandIcon size={16} />
          Enable Gestures
        </div>
      )}
    </button>
  );
}

// Home view content
function HomeContent({ handTrackingEnabled, setHandTrackingEnabled }) {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '5rem 1.5rem 4rem',
      position: 'relative',
      zIndex: 5
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <BotIcon size={72} color="#64748b" />
      </div>
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

      <GestureHint
        onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
        isEnabled={handTrackingEnabled}
      />
    </main>
  );
}

export default function App() {
  const [handTrackingEnabled, setHandTrackingEnabledState] = useState(getPersistedGestureState);
  const [hoveredCourse, setHoveredCourse] = useState(COURSES[0].id);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const setHandTrackingEnabled = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(handTrackingEnabled) : value;
    setHandTrackingEnabledState(newValue);
    try {
      localStorage.setItem(GESTURE_STORAGE_KEY, String(newValue));
    } catch {}
  }, [handTrackingEnabled]);

  // Hand position handler - detects hovering over course track
  const handleHandPosition = useCallback((x, y, gesture) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;

    const el = document.elementFromPoint(screenX, screenY);

    if (el) {
      const courseTrack = el.closest('[data-gesture-course-track]');
      if (courseTrack) {
        const rect = courseTrack.getBoundingClientRect();
        const relativeX = (screenX - rect.left) / rect.width;
        const courseIndex = Math.min(
          Math.floor(relativeX * COURSES.length),
          COURSES.length - 1
        );
        const targetCourse = COURSES[Math.max(0, courseIndex)];
        if (targetCourse) {
          setHoveredCourse(targetCourse.id);
        }
      }
    }
  }, []);

  // Dwell click handler - selects course
  const handleDwellClick = useCallback((x, y) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;

    const el = document.elementFromPoint(screenX, screenY);
    if (!el) return;

    const courseTrack = el.closest('[data-gesture-course-track]');
    if (courseTrack) {
      const rect = courseTrack.getBoundingClientRect();
      const relativeX = (screenX - rect.left) / rect.width;
      const courseIndex = Math.min(
        Math.floor(relativeX * COURSES.length),
        COURSES.length - 1
      );
      const targetCourse = COURSES[Math.max(0, courseIndex)];
      if (targetCourse) {
        setSelectedCourse(targetCourse.id);
      }
    }
  }, []);

  // Get the active course component
  const CourseComponent = selectedCourse ? COURSE_COMPONENTS[selectedCourse] : null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
        radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
        radial-gradient(at 40% 80%, rgba(6, 182, 212, 0.06) 0px, transparent 50%),
        radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px'
    }}>
      <HandBackground
        enabled={handTrackingEnabled}
        onHandPosition={handleHandPosition}
        onDwellClick={handleDwellClick}
      />

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        zIndex: 50,
        pointerEvents: 'none'
      }}>
        {/* Left: Gesture toggle */}
        <div style={{ pointerEvents: 'auto', position: 'relative' }}>
          <button
            onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
            style={{
              position: 'relative',
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: handTrackingEnabled
                ? '1px solid rgba(59, 130, 246, 0.5)'
                : '1px solid rgba(71, 85, 105, 0.5)',
              background: handTrackingEnabled
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(30, 41, 59, 0.5)',
              color: handTrackingEnabled ? '#60a5fa' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={handTrackingEnabled ? 'Disable gestures' : 'Enable gestures'}
          >
            <HandIcon size={18} />
          </button>
          {handTrackingEnabled && (
            <button
              onClick={() => setHandTrackingEnabled(false)}
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 4,
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#f87171',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0
              }}
              title="Disable gestures"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Course Track */}
        <div style={{ pointerEvents: 'auto' }}>
          <CourseTrack
            activeCourse={selectedCourse || hoveredCourse}
            onCourseChange={setHoveredCourse}
            onCourseSelect={(course) => setSelectedCourse(course.id)}
          />
        </div>

        {/* Right: Home button (when course is selected) */}
        <div style={{ width: 42, pointerEvents: 'auto' }}>
          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse(null)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                background: 'rgba(30, 41, 59, 0.5)',
                color: '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Back to Home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, paddingTop: selectedCourse ? '4rem' : 0 }}>
        {CourseComponent ? (
          <CourseComponent onBack={() => setSelectedCourse(null)} />
        ) : (
          <HomeContent
            handTrackingEnabled={handTrackingEnabled}
            setHandTrackingEnabled={setHandTrackingEnabled}
          />
        )}
      </div>
    </div>
  );
}
