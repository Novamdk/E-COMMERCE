import { useEffect, useRef } from 'react';
import { SPIN_WHEEL } from '@/lib/constants';

const SIZE = 300;
const CENTER = SIZE / 2;
const RIM = 14;
const RADIUS = CENTER - RIM;
const LABEL_RADIUS = RADIUS * 0.66;
const SLICE = 360 / SPIN_WHEEL.SEGMENTS.length;
const TICKS = 48;

/**
 * SK palette from the style guide: camellia greens, cream and champagne, with
 * the gold gradient kept for the winning slice. Light and dark slices
 * alternate so every prize label has strong contrast. Literal colours on
 * purpose: the pop-up sits outside any page theme, and this is artwork.
 */
const DARK_INK = '#1f2420';
const LIGHT_INK = '#fbfaf7';
const RIM_BASE = '#1f2a24';
const SEGMENT_COLOURS = [
  { fill: '#f2ede5', ink: DARK_INK }, // silk cream
  { fill: '#26392f', ink: LIGHT_INK }, // camellia green
  { fill: '#e6d3ae', ink: DARK_INK }, // champagne
  { fill: '#4a6f58', ink: LIGHT_INK }, // sage
  { fill: 'url(#spin-wheel-gold)', ink: DARK_INK }, // gold, the winning slice
  { fill: '#355543', ink: LIGHT_INK }, // forest
  { fill: '#fbfaf7', ink: DARK_INK }, // pearl
  { fill: '#1e2e26', ink: LIGHT_INK }, // deep camellia
];

/** @param {number} angleDeg clockwise from 12 o'clock */
function pointAt(angleDeg, radius) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

/** SVG path for one pie slice between two clockwise angles. */
function slicePath(startDeg, endDeg) {
  const [x1, y1] = pointAt(startDeg, RADIUS);
  const [x2, y2] = pointAt(endDeg, RADIUS);
  return `M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 0 1 ${x2},${y2} Z`;
}

/**
 * Final rotation that parks the winning slice under the pointer at the top,
 * after a few full turns for the drama.
 */
export const WIN_ROTATION =
  SPIN_WHEEL.FULL_TURNS * 360 + (360 - (SPIN_WHEEL.WIN_INDEX * SLICE + SLICE / 2));

/**
 * Starts briskly and spends most of its time slowing down, the way a real
 * wheel coasts to a stop. A gentle start (not a snap to full speed) is what
 * keeps the slices from strobing at peak speed.
 */
const SPIN_EASING = 'cubic-bezier(0.3, 0.05, 0.12, 1)';

/**
 * The wheel artwork. Purely presentational: the popup owns when it spins.
 *
 * The spin runs on the Web Animations API rather than Framer Motion. It is a
 * single compositor-driven transform, so it stays smooth even while React is
 * busy, and it is not cut short by the app's reduced-motion setting, which
 * would otherwise make the wheel jump straight to the result.
 *
 * @param {object} props
 * @param {boolean} props.isSpinning
 * @param {() => void} props.onSpinEnd
 */
export function SpinWheel({ isSpinning, onSpinEnd }) {
  const discRef = useRef(null);
  const onSpinEndRef = useRef(onSpinEnd);

  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  useEffect(() => {
    const disc = discRef.current;
    if (!isSpinning || !disc) return undefined;

    const finalTransform = `rotate(${WIN_ROTATION}deg)`;
    if (typeof disc.animate !== 'function') {
      disc.style.transform = finalTransform;
      onSpinEndRef.current();
      return undefined;
    }

    const animation = disc.animate([{ transform: 'rotate(0deg)' }, { transform: finalTransform }], {
      duration: SPIN_WHEEL.SPIN_DURATION_S * 1000,
      easing: SPIN_EASING,
      fill: 'forwards',
    });
    animation.onfinish = () => {
      disc.style.transform = finalTransform;
      onSpinEndRef.current();
    };
    return () => {
      animation.onfinish = null;
    };
  }, [isSpinning]);

  return (
    <div className="relative mx-auto w-full max-w-[18rem]">
      {/* Pointer */}
      <svg
        aria-hidden="true"
        viewBox="0 0 28 34"
        className="absolute top-[-0.625rem] left-1/2 z-10 w-6 -translate-x-1/2 drop-shadow-md"
      >
        <defs>
          <linearGradient id="spin-wheel-pointer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.9 0.08 88)" />
            <stop offset="1" stopColor="oklch(0.62 0.11 72)" />
          </linearGradient>
        </defs>
        <path
          d="M14 34 L2 10 A12 12 0 1 1 26 10 Z"
          fill="url(#spin-wheel-pointer)"
          stroke={RIM_BASE}
          strokeWidth="1"
        />
        <circle cx="14" cy="11" r="3" fill={RIM_BASE} />
      </svg>

      {/* Three stacked layers: a static gold rim, the turning disc, a static
          hub. Only the disc's own HTML box rotates, which the browser can
          hand to the compositor, so the motion stays fluid. */}
      <div aria-hidden="true" className="shadow-lifted relative rounded-full">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full">
          <defs>
            <linearGradient id="spin-wheel-rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="oklch(0.84 0.1 85)" />
              <stop offset="1" stopColor="oklch(0.58 0.11 70)" />
            </linearGradient>
          </defs>
          <circle cx={CENTER} cy={CENTER} r={CENTER - 1} fill={RIM_BASE} />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER - 1.5}
            fill="none"
            stroke="url(#spin-wheel-rim)"
            strokeWidth="1.5"
          />
          {Array.from({ length: TICKS }, (_, index) => {
            const angle = (index * 360) / TICKS;
            const [x1, y1] = pointAt(angle, RADIUS + 3);
            const [x2, y2] = pointAt(angle, CENTER - 4);
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#c9a774"
                strokeOpacity={index % 6 === 0 ? 0.9 : 0.35}
                strokeWidth="1"
              />
            );
          })}
        </svg>

        <div ref={discRef} className="absolute inset-0 will-change-transform">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block size-full">
            <defs>
              <linearGradient id="spin-wheel-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="oklch(0.9 0.08 88)" />
                <stop offset="0.5" stopColor="oklch(0.78 0.12 80)" />
                <stop offset="1" stopColor="oklch(0.66 0.12 72)" />
              </linearGradient>
            </defs>
            {SPIN_WHEEL.SEGMENTS.map((label, index) => {
              const start = index * SLICE;
              const middle = start + SLICE / 2;
              const [lx, ly] = pointAt(middle, LABEL_RADIUS);
              const colour = SEGMENT_COLOURS[index % SEGMENT_COLOURS.length];
              return (
                <g key={`${label}-${start}`}>
                  <path
                    d={slicePath(start, start + SLICE)}
                    fill={colour.fill}
                    stroke="#c9a774"
                    strokeOpacity="0.6"
                    strokeWidth="1"
                  />
                  <text
                    x={lx}
                    y={ly}
                    fill={colour.ink}
                    fontSize="18"
                    fontWeight="500"
                    letterSpacing="0.04em"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${middle} ${lx} ${ly})`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 block size-full">
          <circle cx={CENTER} cy={CENTER} r="25" fill="url(#spin-wheel-rim)" />
          <circle cx={CENTER} cy={CENTER} r="23" fill={RIM_BASE} />
          <text
            x={CENTER}
            y={CENTER}
            fill="#dcc39a"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
          >
            SK
          </text>
        </svg>
      </div>
    </div>
  );
}
