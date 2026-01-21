import { useRef, useState, useEffect } from 'react';

const COURSES = [
  { id: 'neural-networks', label: 'Neural Networks', href: './neural-networks/', icon: '🧠' },
  { id: 'convolutional-networks', label: 'CNNs', href: './convolutional-networks/', icon: '👁️' },
  { id: 'reinforcement-learning', label: 'RL', href: './reinforcement-learning/', icon: '🎮' }
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

      {COURSES.map((course, index) => (
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
            color: activeCourse === course.id ? '#fff' : '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'color 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '1.125rem' }}>{course.icon}</span>
          <span>{course.label}</span>
        </button>
      ))}
    </div>
  );
}

export { COURSES };
