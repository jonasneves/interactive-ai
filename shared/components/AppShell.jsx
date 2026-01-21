import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import HandBackground from './HandBackground.jsx';

const GESTURE_STORAGE_KEY = 'interactive-ai-gestures-enabled';

// Context for sharing hand tracking state across the app
const GestureContext = createContext({
  enabled: false,
  setEnabled: () => {},
  handPosition: null,
  hoveredElement: null
});

export function useGesture() {
  return useContext(GestureContext);
}

// Helper to read persisted gesture state
function getPersistedGestureState() {
  try {
    return localStorage.getItem(GESTURE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function AppShell({ children, onHandPosition, onDwellClick }) {
  const [gestureEnabled, setGestureEnabledState] = useState(getPersistedGestureState);

  // Wrapper to persist state changes
  const setGestureEnabled = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(gestureEnabled) : value;
    setGestureEnabledState(newValue);
    try {
      localStorage.setItem(GESTURE_STORAGE_KEY, String(newValue));
    } catch {}
  }, [gestureEnabled]);
  const [handPosition, setHandPosition] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);

  // Handle hand position updates
  const handleHandPosition = useCallback((x, y, gesture) => {
    setHandPosition({ x, y, gesture });

    // Find element under cursor for hover effects
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;
    const el = document.elementFromPoint(screenX, screenY);

    if (el) {
      const interactive = el.closest('button, a, [role="button"], [data-gesture-target]');
      if (interactive !== hoveredElement) {
        // Remove hover from previous element
        if (hoveredElement) {
          hoveredElement.removeAttribute('data-gesture-hover');
        }
        // Add hover to new element
        if (interactive) {
          interactive.setAttribute('data-gesture-hover', 'true');
        }
        setHoveredElement(interactive);
      }
    }

    // Call parent handler if provided
    onHandPosition?.(x, y, gesture);
  }, [hoveredElement, onHandPosition]);

  // Handle dwell clicks
  const handleDwellClick = useCallback((x, y) => {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;

    // Try to click the element under cursor
    const el = document.elementFromPoint(screenX, screenY);
    if (el) {
      const clickable = el.closest('button, a, [role="button"], [data-gesture-target]');
      if (clickable) {
        clickable.click();
      }
    }

    // Call parent handler if provided
    onDwellClick?.(x, y);
  }, [onDwellClick]);

  const contextValue = {
    enabled: gestureEnabled,
    setEnabled: setGestureEnabled,
    handPosition,
    hoveredElement
  };

  return (
    <GestureContext.Provider value={contextValue}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        backgroundImage: `
          radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
          radial-gradient(at 40% 80%, rgba(6, 182, 212, 0.06) 0px, transparent 50%),
          radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px',
        position: 'relative'
      }}>
        <HandBackground
          enabled={gestureEnabled}
          onHandPosition={handleHandPosition}
          onDwellClick={handleDwellClick}
        />

        {/* Home button - round, gesture-friendly */}
        <a
          href="../"
          data-gesture-target="home"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 100,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.color = '#60a5fa';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Back to Home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </a>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          {children}
        </div>
      </div>
    </GestureContext.Provider>
  );
}
