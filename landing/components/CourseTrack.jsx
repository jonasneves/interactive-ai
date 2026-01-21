import { useRef, useState, useEffect } from 'react';

// Lucide-style icons
const BrainIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M12 18v4"/>
  </svg>
);

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const GamepadIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="12" y2="12"/>
    <line x1="8" x2="8" y1="10" y2="14"/>
    <line x1="15" x2="15.01" y1="13" y2="13"/>
    <line x1="18" x2="18.01" y1="11" y2="11"/>
    <rect width="20" height="12" x="2" y="6" rx="2"/>
  </svg>
);

const COURSES = [
  { id: 'neural-networks', label: 'Neural Networks', href: './neural-networks/', Icon: BrainIcon },
  { id: 'convolutional-networks', label: 'CNNs', href: './convolutional-networks/', Icon: EyeIcon },
  { id: 'reinforcement-learning', label: 'RL', href: './reinforcement-learning/', Icon: GamepadIcon }
];

export default function CourseTrack({ activeCourse, onCourseChange, onCourseSelect }) {
  const trackRef = useRef(null);
  const buttonRefs = useRef([]);
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 });

  const activeIndex = COURSES.findIndex(c => c.id === activeCourse);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  // Update slider position when active course changes
  useEffect(() => {
    const track = trackRef.current;
    const activeButton = buttonRefs.current[safeIndex];
    if (!track || !activeButton) return;

    const trackRect = track.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setSliderStyle({
      width: buttonRect.width,
      left: buttonRect.left - trackRect.left
    });
  }, [safeIndex, activeCourse]);

  // ResizeObserver for responsive updates
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(() => {
      const activeButton = buttonRefs.current[safeIndex];
      if (!activeButton) return;

      const trackRect = track.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setSliderStyle({
        width: buttonRect.width,
        left: buttonRect.left - trackRect.left
      });
    });

    observer.observe(track);
    return () => observer.disconnect();
  }, [safeIndex]);

  return (
    <div
      ref={trackRef}
      data-gesture-course-track="true"
      style={{
        position: 'relative',
        display: 'flex',
        padding: 4,
        borderRadius: 12,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: sliderStyle.width || 'auto',
          left: sliderStyle.left || 0
        }}
      />

      {COURSES.map((course, index) => {
        const isActive = activeCourse === course.id;
        return (
          <button
            key={course.id}
            ref={el => buttonRefs.current[index] = el}
            onClick={() => onCourseSelect?.(course)}
            onMouseEnter={() => onCourseChange?.(course.id)}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: isActive ? '#fff' : '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <course.Icon size={16} color={isActive ? '#fff' : '#94a3b8'} />
            <span>{course.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { COURSES, BrainIcon, EyeIcon, GamepadIcon };
