import { m } from 'framer-motion';
import { SPIN_WHEEL } from '@/lib/constants';

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 6;
const LABEL_RADIUS = RADIUS * 0.68;
const SLICE = 360 / SPIN_WHEEL.SEGMENTS.length;

/** Alternating fills from the brand tokens, so the wheel follows the theme. */
const FILLS = ['var(--color-surface-sunken)', 'var(--color-brand-700)'];
const INKS = ['var(--color-content)', 'var(--color-content-inverse)'];

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
 * The wheel artwork. Purely presentational: the popup owns when it spins.
 *
 * @param {object} props
 * @param {boolean} props.isSpinning
 * @param {() => void} props.onSpinEnd
 */
export function SpinWheel({ isSpinning, onSpinEnd }) {
  return (
    <div className="relative mx-auto w-full max-w-[17.5rem]">
      {/* Pointer */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 20"
        className="text-accent-600 absolute top-[-0.375rem] left-1/2 z-10 w-6 -translate-x-1/2 drop-shadow"
      >
        <path d="M12 20 L0 0 H24 Z" fill="currentColor" />
      </svg>

      <m.div
        aria-hidden="true"
        initial={{ rotate: 0 }}
        animate={{ rotate: isSpinning ? WIN_ROTATION : 0 }}
        transition={
          isSpinning
            ? { duration: SPIN_WHEEL.SPIN_DURATION_S, ease: [0.12, 0.6, 0.12, 1] }
            : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (isSpinning) onSpinEnd();
        }}
        className="shadow-lifted rounded-full"
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full">
          <circle cx={CENTER} cy={CENTER} r={CENTER - 1} fill="var(--color-brand-900)" />
          {SPIN_WHEEL.SEGMENTS.map((label, index) => {
            const start = index * SLICE;
            const middle = start + SLICE / 2;
            const [lx, ly] = pointAt(middle, LABEL_RADIUS);
            return (
              <g key={`${label}-${start}`}>
                <path d={slicePath(start, start + SLICE)} fill={FILLS[index % 2]} />
                <text
                  x={lx}
                  y={ly}
                  fill={INKS[index % 2]}
                  fontSize="18"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${middle} ${lx} ${ly})`}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.04em' }}
                >
                  {label}
                </text>
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r="22" fill="var(--color-surface-raised)" />
          <circle cx={CENTER} cy={CENTER} r="6" fill="var(--color-brand-700)" />
        </svg>
      </m.div>
    </div>
  );
}
