import { useRef, useState, useEffect } from 'react';

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
  { id: 'neural-networks', label: 'Neural Networks', Icon: BrainIcon },
  { id: 'convolutional-networks', label: 'CNNs', Icon: EyeIcon },
  { id: 'reinforcement-learning', label: 'RL', Icon: GamepadIcon }
];

export default function CourseTrack({ activeCourse, onCourseChange, onCourseSelect }) {
  const trackRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(null);
  const [sliderLeft, setSliderLeft] = useState(null);

  const activeIndex = COURSES.findIndex(c => c.id === activeCourse);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  useEffect(() => {
    if (!trackRef.current) return;

    const updateSliderPosition = () => {
      const track = trackRef.current;
      if (!track) return;

      const buttons = track.querySelectorAll('button[role="radio"]');
      if (buttons.length === 0 || safeIndex >= buttons.length) return;

      const activeButton = buttons[safeIndex];
      const buttonRect = activeButton.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();

      setSliderWidth(buttonRect.width);
      setSliderLeft(buttonRect.left - trackRect.left);
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(updateSliderPosition, 0);

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateSliderPosition, 0);
    });
    resizeObserver.observe(trackRef.current);

    window.addEventListener('resize', updateSliderPosition);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSliderPosition);
    };
  }, [safeIndex]);

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      data-gesture-course-track="true"
      className="course-track"
    >
      {/* Sliding indicator */}
      <div
        className="course-slider"
        style={{
          width: sliderWidth !== null ? sliderWidth : `calc((100% - 8px) / ${COURSES.length})`,
          left: sliderLeft !== null ? sliderLeft : `calc(4px + (100% - 8px) * ${safeIndex} / ${COURSES.length})`
        }}
      />

      {COURSES.map((course, index) => {
        const isActive = activeCourse === course.id;
        return (
          <button
            key={course.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onCourseSelect?.(course)}
            onMouseEnter={() => onCourseChange?.(course.id)}
            className={`course-button ${isActive ? 'active' : ''}`}
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
