import { useEffect, useRef } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

const GESTURE_COLORS = {
  'Pointing_Up': { color: '#06b6d4', glow: '#67e8f9' },
  'Thumb_Up': { color: '#22c55e', glow: '#86efac' },
  'Thumb_Down': { color: '#f97316', glow: '#fdba74' },
  'Closed_Fist': { color: '#a855f7', glow: '#d8b4fe' },
  'Open_Palm': { color: '#f59e0b', glow: '#fcd34d' },
  'Victory': { color: '#ec4899', glow: '#f9a8d4' },
  'ILoveYou': { color: '#ef4444', glow: '#f87171' },
  'default': { color: '#3b82f6', glow: '#60a5fa' }
};

const CURSOR_SMOOTHING = 0.4;
const DWELL_TIME = 1200;
const DWELL_THRESHOLD = 0.05;
const CURSOR_SIZE = 24;
const SCROLL_MULTIPLIER = 1800;
const SCROLL_VELOCITY_THRESHOLD = 0.006;
const SCROLL_RESET_THRESHOLD = 0.02;

export default function HandBackground({ enabled = false, onHandPosition, onGesture, onDwellClick }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorRingRef = useRef(null);
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(-1);

  // Refs for callbacks to avoid stale closures
  const onHandPositionRef = useRef(onHandPosition);
  const onGestureRef = useRef(onGesture);
  const onDwellClickRef = useRef(onDwellClick);

  // Smoothed cursor position
  const smoothedPosRef = useRef({ x: 0.5, y: 0.5 });

  // Dwell state
  const dwellStateRef = useRef({
    position: { x: 0.5, y: 0.5 },
    startTime: 0,
    lastGesture: null
  });

  // Scroll state for closed fist drag (velocity-based like serverless-llm)
  const scrollStateRef = useRef({
    lastY: null,
    isScrolling: false,
    velocity: 0
  });

  // Update refs when props change
  useEffect(() => {
    onHandPositionRef.current = onHandPosition;
    onGestureRef.current = onGesture;
    onDwellClickRef.current = onDwellClick;
  }, [onHandPosition, onGesture, onDwellClick]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function start() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        if (cancelled) return;

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });

        if (cancelled) {
          recognizer.close();
          return;
        }

        recognizerRef.current = recognizer;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          recognizer.close();
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        lastTimeRef.current = -1;

        function draw() {
          if (cancelled) return;

          const canvas = canvasRef.current;
          const cursor = cursorRef.current;
          const cursorRing = cursorRingRef.current;
          const ctx = canvas?.getContext('2d');
          if (!ctx || !video.videoWidth || !recognizerRef.current) {
            rafRef.current = requestAnimationFrame(draw);
            return;
          }

          const w = window.innerWidth;
          const h = window.innerHeight;
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          const now = performance.now();
          if (now <= lastTimeRef.current) {
            rafRef.current = requestAnimationFrame(draw);
            return;
          }
          lastTimeRef.current = now;

          let result;
          try {
            result = recognizerRef.current.recognizeForVideo(video, now);
          } catch {
            rafRef.current = requestAnimationFrame(draw);
            return;
          }

          ctx.clearRect(0, 0, w, h);

          // Cursor state
          let isPointing = false;
          let isScrolling = false;
          let dwellProgress = 0;

          if (result?.landmarks?.length) {
            for (let i = 0; i < result.landmarks.length; i++) {
              const hand = result.landmarks[i];
              const gesture = result.gestures?.[i]?.[0]?.categoryName;
              const colors = GESTURE_COLORS[gesture] || GESTURE_COLORS.default;

              // Get index finger tip (landmark 8) for pointing
              const indexTip = hand[8];
              // Mirror the x coordinate since video is mirrored
              const rawX = 1 - indexTip.x;
              const rawY = indexTip.y;

              // Smooth the position
              const smoothed = smoothedPosRef.current;
              smoothed.x += (rawX - smoothed.x) * CURSOR_SMOOTHING;
              smoothed.y += (rawY - smoothed.y) * CURSOR_SMOOTHING;

              // Report position for pointing gesture
              if (gesture === 'Pointing_Up') {
                isPointing = true;
                scrollStateRef.current.lastY = null; // Reset scroll when pointing

                if (onHandPositionRef.current) {
                  onHandPositionRef.current(smoothed.x, smoothed.y, gesture);
                }

                // Update cursor position (convert to screen coords, account for mirroring)
                if (cursor) {
                  const screenX = smoothed.x * w;
                  const screenY = smoothed.y * h;
                  cursor.style.transform = `translate(${screenX - CURSOR_SIZE / 2}px, ${screenY - CURSOR_SIZE / 2}px)`;
                  cursor.style.opacity = '1';
                }

                // Dwell click detection
                const dwell = dwellStateRef.current;
                const dist = Math.sqrt(
                  Math.pow(smoothed.x - dwell.position.x, 2) +
                  Math.pow(smoothed.y - dwell.position.y, 2)
                );

                if (dist > DWELL_THRESHOLD) {
                  // Hand moved, reset dwell
                  dwell.position = { x: smoothed.x, y: smoothed.y };
                  dwell.startTime = now;
                } else {
                  // Check dwell time
                  const dwellDuration = now - dwell.startTime;
                  dwellProgress = Math.min(dwellDuration / DWELL_TIME, 1);

                  if (dwellDuration >= DWELL_TIME && onDwellClickRef.current) {
                    onDwellClickRef.current(smoothed.x, smoothed.y);
                    dwell.startTime = now + 500; // Prevent rapid re-triggers
                  }
                }
              }

              // Closed fist scroll - velocity-based smooth scrolling (like serverless-llm)
              if (gesture === 'Closed_Fist') {
                isScrolling = true;
                const scroll = scrollStateRef.current;
                // Use wrist position (landmark 0) for more stable tracking
                const wristY = hand[0].y;

                // Show scroll cursor at wrist position
                if (cursor) {
                  const wristX = 1 - hand[0].x; // Mirror x
                  const screenX = wristX * w;
                  const screenY = wristY * h;
                  cursor.style.transform = `translate(${screenX - CURSOR_SIZE / 2}px, ${screenY - CURSOR_SIZE / 2}px)`;
                  cursor.style.opacity = '1';
                }

                if (!scroll.isScrolling) {
                  // Starting to scroll
                  scroll.isScrolling = true;
                  scroll.lastY = wristY;
                  scroll.velocity = 0;
                } else if (scroll.lastY !== null) {
                  const delta = wristY - scroll.lastY;
                  // Exponential smoothing for velocity
                  const vel = scroll.velocity * 0.6 + delta * 0.4;
                  scroll.velocity = vel;

                  // Only scroll if velocity exceeds threshold (prevents jitter)
                  // Negate velocity for natural "drag" behavior (content follows hand)
                  if (Math.abs(vel) > SCROLL_VELOCITY_THRESHOLD) {
                    window.scrollBy({ top: -vel * SCROLL_MULTIPLIER, behavior: 'auto' });
                    scroll.lastY = wristY;
                  } else if (Math.abs(delta) > SCROLL_RESET_THRESHOLD) {
                    // Reset position if hand moved significantly but slowly
                    scroll.lastY = wristY;
                  }
                }
              } else {
                // Reset scroll state when not making fist
                scrollStateRef.current.isScrolling = false;
                scrollStateRef.current.lastY = null;
                scrollStateRef.current.velocity = 0;
              }

              // Report gesture changes
              if (gesture && gesture !== dwellStateRef.current.lastGesture) {
                dwellStateRef.current.lastGesture = gesture;
                if (onGestureRef.current) {
                  onGestureRef.current(gesture, smoothed.x, smoothed.y);
                }
              }

              // Draw hand skeleton
              const conns = [
                [0,1],[1,2],[2,3],[3,4],
                [0,5],[5,6],[6,7],[7,8],
                [0,9],[9,10],[10,11],[11,12],
                [0,13],[13,14],[14,15],[15,16],
                [0,17],[17,18],[18,19],[19,20],
                [5,9],[9,13],[13,17]
              ];

              ctx.shadowColor = colors.color;
              ctx.shadowBlur = 8;
              ctx.strokeStyle = colors.color;
              ctx.lineWidth = 2;

              for (const [s, e] of conns) {
                ctx.beginPath();
                ctx.moveTo(hand[s].x * w, hand[s].y * h);
                ctx.lineTo(hand[e].x * w, hand[e].y * h);
                ctx.stroke();
              }

              for (let j = 0; j < hand.length; j++) {
                const pt = hand[j];
                const x = pt.x * w;
                const y = pt.y * h;
                const isTip = [4, 8, 12, 16, 20].includes(j);

                ctx.beginPath();
                ctx.arc(x, y, isTip ? 4 : 2, 0, Math.PI * 2);
                ctx.fillStyle = isTip ? '#fff' : '#1e293b';
                ctx.shadowColor = colors.glow;
                ctx.shadowBlur = isTip ? 15 : 5;
                ctx.fill();

                if (!isTip) {
                  ctx.strokeStyle = colors.glow;
                  ctx.lineWidth = 1;
                  ctx.stroke();
                }
              }
              ctx.shadowBlur = 0;
            }
          }

          // Update cursor visibility and dwell ring
          if (cursor) {
            cursor.style.opacity = (isPointing || isScrolling) ? '1' : '0';
          }
          if (cursorRing) {
            // Update the ring progress (stroke-dashoffset)
            const circumference = 2 * Math.PI * 14; // radius = 14
            const offset = circumference * (1 - dwellProgress);
            cursorRing.style.strokeDashoffset = offset.toString();
            cursorRing.style.stroke = dwellProgress >= 1 ? '#22c55e' : '#3b82f6';
          }

          rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);

      } catch (err) {
        console.error('[Hand] Error:', err);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      recognizerRef.current?.close();
      recognizerRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  const circumference = 2 * Math.PI * 14;

  return (
    <>
      {/* Hand skeleton layer (behind content) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: 'scaleX(-1)'
      }}>
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
        <canvas ref={canvasRef} style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.8
        }} />
      </div>

      {/* Cursor indicator (in front of content) */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.15s ease-out'
        }}
      >
        {/* Outer glow */}
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        }} />

        {/* Main cursor dot */}
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          boxShadow: '0 0 12px rgba(96, 165, 250, 0.6), 0 0 24px rgba(96, 165, 250, 0.3)',
        }} />

        {/* Dwell progress ring */}
        <svg
          width={CURSOR_SIZE + 8}
          height={CURSOR_SIZE + 8}
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
          }}
        >
          {/* Background ring */}
          <circle
            cx={(CURSOR_SIZE + 8) / 2}
            cy={(CURSOR_SIZE + 8) / 2}
            r={14}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <circle
            ref={cursorRingRef}
            cx={(CURSOR_SIZE + 8) / 2}
            cy={(CURSOR_SIZE + 8) / 2}
            r={14}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke 0.2s',
              filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))'
            }}
          />
        </svg>
      </div>
    </>
  );
}
