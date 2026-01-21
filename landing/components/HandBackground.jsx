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

export default function HandBackground({ enabled = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(-1);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function start() {
      try {
        console.log('[Hand] Loading MediaPipe...');
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
        console.log('[Hand] Recognizer ready');

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

        console.log('[Hand] Camera started');
        lastTimeRef.current = -1;

        function draw() {
          if (cancelled) return;

          const canvas = canvasRef.current;
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

          if (result?.landmarks?.length) {
            for (let i = 0; i < result.landmarks.length; i++) {
              const hand = result.landmarks[i];
              const gesture = result.gestures?.[i]?.[0]?.categoryName;
              const colors = GESTURE_COLORS[gesture] || GESTURE_COLORS.default;

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

  return (
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
  );
}
