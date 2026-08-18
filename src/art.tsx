// Copyright (C) 2026 Neon Law Foundation.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Original illustrations for Count II.
 *
 * Drawn here rather than fetched, for two reasons that happen to agree. The
 * legal one: the characters this fixture alludes to are somebody's, and a
 * sample application that ships scraped frames of them teaches a contributor
 * the wrong habit. The architectural one: Navigator serves this bundle under
 * `script-src 'self'` with no off-origin sources, and the library stylesheet is
 * built to fetch nothing at runtime — a hotlinked image would be the only thing
 * in the bundle that could fail because of somebody else's server.
 *
 * So these are silhouettes and shapes: a horned figure over a hedge, a round
 * one reaching, and a doughnut with something in it. Every fill is a `--nav-*`
 * token or a gradient built from one, which is what lets them follow the portal
 * into dark mode with no second copy.
 */

/** Bite state, which is the whole chronology in one enum. */
export type BiteState = 'whole' | 'bitten' | 'gone'

/** Sprinkle placements, chosen so none of them land in the hole or on the bite. */
const SPRINKLES: { x: number; y: number; rotate: number; warm: boolean }[] = [
  { x: 70, y: 58, rotate: -30, warm: true },
  { x: 124, y: 62, rotate: 20, warm: false },
  { x: 58, y: 118, rotate: 55, warm: false },
  { x: 136, y: 126, rotate: -15, warm: true },
  { x: 100, y: 44, rotate: 5, warm: false },
  { x: 46, y: 88, rotate: 70, warm: false },
  { x: 150, y: 92, rotate: -50, warm: true },
  { x: 96, y: 158, rotate: 10, warm: false },
  { x: 66, y: 148, rotate: -35, warm: false },
  { x: 132, y: 156, rotate: 40, warm: true },
]

/**
 * The hedge scene: the offer, as pleaded.
 *
 * `aria-hidden` is deliberate — the caption beneath it in the page carries the
 * same content as text, and a screen reader should hear that once.
 */
export function HedgeScene() {
  return (
    <svg
      viewBox="0 0 800 300"
      width="100%"
      aria-hidden="true"
      style={{ display: 'block', borderRadius: 'var(--radius)' }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--muted)" />
          <stop offset="55%" stopColor="color-mix(in oklch, var(--chart-3) 16%, var(--background))" />
          <stop offset="100%" stopColor="color-mix(in oklch, var(--chart-2) 14%, var(--background))" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--chart-3)" stopOpacity="0.85" />
          <stop offset="60%" stopColor="var(--chart-3)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--chart-3)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="300" fill="url(#sky)" />

      {/* A low sun behind the defendant, because the pleading says so. */}
      <circle cx="655" cy="120" r="58" fill="var(--chart-3)" opacity="0.28" />

      {/* Plaintiff: round, unsuspecting, reaching. */}
      <g fill="var(--foreground)" opacity="0.86">
        <circle cx="205" cy="132" r="41" />
        <path d="M164 300 v-96 a41 41 0 0 1 82 0 v96 z" />
        {/* The reaching arm. */}
        <path
          d="M243 186 q54 -12 88 -30"
          stroke="var(--foreground)"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Defendant: taller, horned, extending the instrument. */}
      <g fill="var(--chart-2)">
        <circle cx="600" cy="118" r="38" />
        {/* Horns. */}
        <path d="M572 90 q-16 -26 -3 -44 q13 14 22 32 z" />
        <path d="M628 90 q16 -26 3 -44 q-13 14 -22 32 z" />
        <path d="M562 300 v-108 a38 38 0 0 1 76 0 v108 z" />
        <path
          d="M566 178 q-56 -6 -96 12"
          stroke="var(--chart-2)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* The doughnut, mid-air, mid-offer. */}
      <g transform="translate(400 186)">
        <circle r="72" fill="url(#glow)" />
        <circle r="34" fill="var(--chart-3)" stroke="var(--foreground)" strokeWidth="3" />
        <circle r="12" fill="var(--card)" stroke="var(--foreground)" strokeWidth="2.5" />
      </g>

      {/* The hedge, which is where every neighborly conversation in this matter happens. */}
      <g fill="var(--chart-4)">
        <rect y="228" width="800" height="72" opacity="0.9" />
        {[...Array(21).keys()].map((i) => (
          <circle key={i} cx={i * 40 + 10} cy="230" r="24" opacity="0.9" />
        ))}
      </g>
      <rect y="228" width="800" height="4" fill="var(--foreground)" opacity="0.14" />
    </svg>
  )
}

/**
 * The instrument itself, in whatever state the reader has scrubbed it to.
 *
 * The `§` at the center is the concealed term — visible to us because we are
 * reading the pleading, and not to the offeree, which is the entire count.
 */
export function Doughnut({ state = 'whole', size = 200 }: { state?: BiteState; size?: number }) {
  const gone = state === 'gone'
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={
        gone
          ? 'The doughnut, fully consumed'
          : state === 'bitten'
            ? 'The doughnut with a single bite taken from it'
            : 'The doughnut, whole'
      }
      style={{ display: 'block' }}
    >
      <defs>
        {/*
         * The bite is a mask, not a path edit: the same dough and the same
         * glaze are drawn in every state, and only what shows through changes.
         * One shape to maintain instead of three.
         */}
        <mask id="bite-mask">
          <rect width="200" height="200" fill="white" />
          {state === 'bitten' ? <circle cx="163" cy="52" r="34" fill="black" /> : null}
          {gone ? <rect width="200" height="200" fill="black" /> : null}
        </mask>
      </defs>

      {/* Where the doughnut was — always drawn, so "gone" reads as absence rather than a blank box. */}
      <circle
        cx="100"
        cy="100"
        r="76"
        fill="none"
        stroke="var(--border)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />

      <g mask="url(#bite-mask)">
        <circle cx="100" cy="100" r="76" fill="var(--chart-3)" opacity="0.55" />
        <circle
          cx="100"
          cy="100"
          r="66"
          fill="var(--chart-3)"
          stroke="var(--foreground)"
          strokeWidth="2.5"
          opacity="0.95"
        />
        <circle
          cx="100"
          cy="100"
          r="24"
          fill="var(--card)"
          stroke="var(--foreground)"
          strokeWidth="2.5"
        />
        {/* Sprinkles, placed by hand so they never land in the hole. */}
        {SPRINKLES.map((sprinkle) => (
          <rect
            key={`${sprinkle.x}-${sprinkle.y}`}
            x={sprinkle.x - 6}
            y={sprinkle.y - 2}
            width="12"
            height="4"
            rx="2"
            transform={`rotate(${sprinkle.rotate} ${sprinkle.x} ${sprinkle.y})`}
            fill={sprinkle.warm ? 'var(--chart-2)' : 'var(--chart-5)'}
          />
        ))}
      </g>

      {/* The concealed term, sitting in the hole where nobody eating would look. */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dy="0.35em"
        fontSize="26"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="700"
        fill="var(--chart-2)"
        opacity={gone ? 1 : 0.85}
      >
        §
      </text>
    </svg>
  )
}
