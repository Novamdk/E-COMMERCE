import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/** SK palette: champagne, gold, camellia greens, cream and argan. */
const COLOURS = ['#e6d3ae', '#c9a774', '#b08a4f', '#26392f', '#4a6f58', '#fbfaf7', '#8a4a22'];
const PIECES = 140;
const DURATION_MS = 2400;
const GRAVITY = 0.32;
const DRAG = 0.985;

function makePiece(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 6 + Math.random() * 9;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 6, // a little upward lift, like a popper
    size: 5 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.4,
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    isRound: Math.random() < 0.3,
  };
}

/**
 * A one-off party-popper burst over everything, from `origin` (viewport px).
 * Canvas only, no dependency, ignores pointer events, and draws nothing for
 * anyone who has asked their device for reduced motion.
 *
 * @param {object} props
 * @param {{ x: number, y: number }} props.origin
 */
export function ConfettiBurst({ origin }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    const pieces = Array.from({ length: PIECES }, () => makePiece(origin.x, origin.y));
    const start = performance.now();
    let frame = 0;

    const draw = (now) => {
      const elapsed = now - start;
      context.clearRect(0, 0, width, height);
      // Full strength for most of the burst, then a quick fade out.
      context.globalAlpha = Math.max(0, Math.min(1, (DURATION_MS - elapsed) / 600));
      for (const piece of pieces) {
        piece.vx *= DRAG;
        piece.vy = piece.vy * DRAG + GRAVITY;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.colour;
        if (piece.isRound) {
          context.beginPath();
          context.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          // Flat paper strips that seem to flutter as they turn.
          context.fillRect(
            -piece.size / 2,
            -piece.size / 4,
            piece.size,
            (piece.size / 2) * Math.abs(Math.cos(piece.rotation * 2)) + 1,
          );
        }
        context.restore();
      }
      if (elapsed < DURATION_MS) frame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [origin]);

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] size-full"
    />,
    document.body,
  );
}
