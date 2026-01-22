import { useState, useCallback } from 'react';
import { HandBackground } from '../shared/components';
import CourseTrack, { COURSES } from './components/CourseTrack';

import { CourseContent as NeuralNetworksContent } from '../neural-networks/App';
import { CourseContent as CNNContent } from '../convolutional-networks/App';
import { CourseContent as RLContent } from '../reinforcement-learning/App';

const GESTURE_STORAGE_KEY = 'interactive-ai-gestures-enabled';

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

function HomeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function HomeContent() {
  return (
    <main className="home-content">
      <BotIcon size={64} color="#475569" />
      <h1 className="home-title">InteractiveAI</h1>
      <p className="home-subtitle">
        Educational visualizations for understanding AI
      </p>
      <p className="home-hint">
        Select a course above to begin
      </p>
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

  function getCourseFromPosition(x, y) {
    const screenX = x * window.innerWidth;
    const screenY = y * window.innerHeight;
    const el = document.elementFromPoint(screenX, screenY);
    if (!el) return null;

    const courseTrack = el.closest('[data-gesture-course-track]');
    if (!courseTrack) return null;

    const rect = courseTrack.getBoundingClientRect();
    const relativeX = (screenX - rect.left) / rect.width;
    const courseIndex = Math.max(0, Math.min(
      Math.floor(relativeX * COURSES.length),
      COURSES.length - 1
    ));
    return COURSES[courseIndex];
  }

  const handleHandPosition = useCallback((x, y) => {
    const course = getCourseFromPosition(x, y);
    if (course) setHoveredCourse(course.id);
  }, []);

  const handleDwellClick = useCallback((x, y) => {
    const course = getCourseFromPosition(x, y);
    if (course) setSelectedCourse(course.id);
  }, []);

  const CourseComponent = selectedCourse ? COURSE_COMPONENTS[selectedCourse] : null;

  return (
    <div className="app-container">
      <HandBackground
        enabled={handTrackingEnabled}
        onHandPosition={handleHandPosition}
        onDwellClick={handleDwellClick}
      />

      <header className="app-header">
        <div className="header-left">
          <button
            onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
            className={`gesture-toggle ${handTrackingEnabled ? 'active' : ''}`}
            title={handTrackingEnabled ? 'Disable gestures' : 'Enable gestures'}
          >
            <HandIcon size={18} />
          </button>
        </div>

        <CourseTrack
          activeCourse={selectedCourse || hoveredCourse}
          onCourseChange={setHoveredCourse}
          onCourseSelect={(course) => setSelectedCourse(course.id)}
        />

        <div className="header-right">
          {selectedCourse && (
            <button
              onClick={() => setSelectedCourse(null)}
              className="home-button"
              title="Back to Home"
            >
              <HomeIcon size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="app-content">
        {CourseComponent ? (
          <CourseComponent onBack={() => setSelectedCourse(null)} />
        ) : (
          <HomeContent />
        )}
      </div>
    </div>
  );
}
